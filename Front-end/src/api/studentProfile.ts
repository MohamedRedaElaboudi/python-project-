const API_BASE = "http://localhost:5000/api/v1";

export const getStudentProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("NO_TOKEN");

  const res = await fetch(`${API_BASE}/student/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("PROFILE_FETCH_ERROR");
  }

  return res.json();
};

export const updateStudentProfile = async (data: any) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("NO_TOKEN");

  const res = await fetch(`${API_BASE}/student/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("PROFILE_UPDATE_ERROR");
  }

  return res.json();
};
