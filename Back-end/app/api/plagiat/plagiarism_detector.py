import re
import aiohttp
import torch
from typing import List, Dict, Any

from sentence_transformers import SentenceTransformer, util
from sklearn.feature_extraction.text import TfidfVectorizer
from transformers import AutoTokenizer, AutoModelForCausalLM


class PlagiarismDetector:
    def __init__(self):
        print("­ƒöº Initialisation du D├®tecteur de Plagiat")

        try:
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
            print("Ô£à SentenceTransformer charg├®")
        except Exception as e:
            print(f"ÔØî Erreur mod├¿le s├®mantique : {e}")
            self.model = None

        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=5000,
            stop_words="english"
        )

        try:
            self.ai_tokenizer = AutoTokenizer.from_pretrained("distilgpt2")
            self.ai_model = AutoModelForCausalLM.from_pretrained("distilgpt2")
            self.has_ai_detector = True
            print("Ô£à D├®tecteur IA charg├®")
        except Exception:
            self.has_ai_detector = False
            print("ÔÜá´©Å D├®tection IA d├®sactiv├®e")

        self.stats = {
            "semantic_checks": 0,
            "web_checks": 0,
            "matches_found": 0,
            "errors": 0
        }

        print("Ô£à D├®tecteur pr├¬t")

    def preprocess(self, text: str) -> str:
        text = text.lower()
        text = re.sub(r"[^\w\s├á-├┐]", " ", text)
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def calculate_similarity(self, text1: str, text2: str) -> float:
        if not self.model:
            return 0.0

        self.stats["semantic_checks"] += 1

        t1 = self.preprocess(text1[:800])
        t2 = self.preprocess(text2[:800])

        try:
            tfidf = self.vectorizer.fit_transform([t1, t2])
            tfidf_sim = (tfidf[0] @ tfidf[1].T).toarray()[0][0]
        except Exception:
            tfidf_sim = 0

        try:
            emb = self.model.encode([t1, t2], convert_to_tensor=True)
            semantic_sim = util.cos_sim(emb[0], emb[1]).item()
        except Exception:
            semantic_sim = 0

        words1, words2 = set(t1.split()), set(t2.split())
        jaccard = len(words1 & words2) / len(words1 | words2) if words1 else 0

        return round(0.6 * semantic_sim + 0.3 * tfidf_sim + 0.1 * jaccard, 4)

    def calculate_ai_score(self, text: str) -> Dict[str, Any]:
        if not self.has_ai_detector or len(text.split()) < 100:
            return {"ai_score": 0, "risk": "none"}

        try:
            enc = self.ai_tokenizer(
                text[:1024], return_tensors="pt", truncation=True
            )
            with torch.no_grad():
                loss = self.ai_model(**enc, labels=enc["input_ids"]).loss
            perplexity = torch.exp(loss).item()
        except Exception:
            return {"ai_score": 0, "risk": "unknown"}

        score = 100 if perplexity < 30 else max(0, 100 - perplexity)
        risk = "high" if score > 70 else "medium" if score > 40 else "low"

        return {
            "ai_score": round(score, 2),
            "perplexity": round(perplexity, 2),
            "risk": risk
        }

    async def _search_semantic_scholar(
            self, query: str, session: aiohttp.ClientSession
    ) -> List[Dict]:
        self.stats["web_checks"] += 1
        url = "https://api.semanticscholar.org/graph/v1/paper/search"

        params = {
            "query": query[:200],
            "limit": 5,
            "fields": "title,abstract,url"
        }

        results = []

        try:
            async with session.get(url, params=params, timeout=15) as r:
                if r.status != 200:
                    return results

                data = await r.json()

                for paper in data.get("data", []):
                    abstract = paper.get("abstract")
                    if not abstract:
                        continue

                    sim = self.calculate_similarity(query, abstract)
                    if sim > 0.25:
                        results.append({
                            "title": paper.get("title"),
                            "url": paper.get("url"),
                            "similarity": sim,
                            "source": "Semantic Scholar"
                        })
                        self.stats["matches_found"] += 1

        except Exception:
            self.stats["errors"] += 1

        return results

    async def _search_crossref(
            self, query: str, session: aiohttp.ClientSession
    ) -> List[Dict]:
        url = "https://api.crossref.org/works"
        params = {"query": query[:200], "rows": 5}
        results = []

        try:
            async with session.get(url, params=params, timeout=15) as r:
                if r.status != 200:
                    return results

                items = (await r.json()).get("message", {}).get("items", [])

                for item in items:
                    title = " ".join(item.get("title", []))
                    sim = self.calculate_similarity(query, title)

                    if sim > 0.25:
                        results.append({
                            "title": title,
                            "url": item.get("URL"),
                            "similarity": sim,
                            "source": "CrossRef"
                        })
                        self.stats["matches_found"] += 1

        except Exception:
            self.stats["errors"] += 1

        return results

    async def check_web_source(
            self, text_chunk: str, session: aiohttp.ClientSession, chunk_index: int = -1
    ) -> List[Dict]:
        if len(text_chunk.strip()) < 50:
            return []

        results = []
        semantic_results = await self._search_semantic_scholar(text_chunk, session)
        crossref_results = await self._search_crossref(text_chunk, session)

        for res in semantic_results:
            res['chunk_index'] = chunk_index
            res['query_text'] = text_chunk[:500]
            res['matched_text'] = res.get('title', '')[:200]
            res['original_text'] = text_chunk[:200]
            res['score'] = round(res.get('similarity', 0) * 100, 2)

        for res in crossref_results:
            res['chunk_index'] = chunk_index
            res['query_text'] = text_chunk[:500]
            res['matched_text'] = res.get('title', '')[:200]
            res['original_text'] = text_chunk[:200]
            res['score'] = round(res.get('similarity', 0) * 100, 2)

        results = semantic_results + crossref_results

        unique = {}
        for r in results:
            if r.get("url"):
                if r["url"] not in unique or r["similarity"] > unique[r["url"]]["similarity"]:
                    unique[r["url"]] = r

        sorted_results = sorted(
            unique.values(),
            key=lambda x: x["similarity"],
            reverse=True
        )[:5]

        return sorted_results

    def get_stats(self) -> Dict:
        return self.stats.copy()
