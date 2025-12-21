import React from 'react';
import {
    Card,
    CardContent,
    Box,
    Typography,
    Chip,
    Stack,
    Divider,
} from '@mui/material';
import {
    CalendarToday,
    AccessTime,
    Room,
    Person,
    Article,
} from '@mui/icons-material';
import { RoleChip } from './RoleChip';

interface SoutenanceCardProps {
    id: number;
    date: string;
    time: string;
    studentName: string;
    rapportTitle: string;
    salle: string;
    role: string;
    isUpcoming?: boolean;
    onClick?: () => void;
}

export const SoutenanceCard: React.FC<SoutenanceCardProps> = ({
    date,
    time,
    studentName,
    rapportTitle,
    salle,
    role,
    isUpcoming = false,
    onClick,
}) => {
    // Format date
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <Card
            onClick={onClick}
            sx={{
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                borderLeft: isUpcoming ? '4px solid' : 'none',
                borderLeftColor: 'primary.main',
                '&:hover': onClick
                    ? {
                        transform: 'translateX(4px)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    }
                    : {},
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Typography variant="h6" fontWeight="600" gutterBottom>
                                {studentName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Article fontSize="small" />
                                {rapportTitle}
                            </Typography>
                        </Box>
                        <RoleChip role={role} />
                    </Box>

                    <Divider />

                    {/* Details */}
                    <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                {formatDate(date)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                {time}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Room fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                Salle {salle}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Badge if upcoming */}
                    {isUpcoming && (
                        <Chip
                            label="À venir"
                            color="primary"
                            size="small"
                            sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
                        />
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};
