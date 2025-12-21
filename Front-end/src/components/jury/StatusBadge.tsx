import React from 'react';
import { Chip } from '@mui/material';
import { CheckCircle, Schedule, Cancel, HourglassEmpty } from '@mui/icons-material';

interface StatusBadgeProps {
    status: 'pending' | 'completed' | 'in_progress' | 'cancelled';
    size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
    const getConfig = () => {
        switch (status) {
            case 'completed':
                return {
                    label: 'Complété',
                    color: 'success' as const,
                    icon: <CheckCircle />,
                };
            case 'in_progress':
                return {
                    label: 'En cours',
                    color: 'info' as const,
                    icon: <HourglassEmpty />,
                };
            case 'pending':
                return {
                    label: 'En attente',
                    color: 'warning' as const,
                    icon: <Schedule />,
                };
            case 'cancelled':
                return {
                    label: 'Annulé',
                    color: 'error' as const,
                    icon: <Cancel />,
                };
            default:
                return {
                    label: 'Inconnu',
                    color: 'default' as const,
                    icon: <Schedule />,
                };
        }
    };

    const config = getConfig();

    return (
        <Chip
            icon={config.icon}
            label={config.label}
            color={config.color}
            size={size}
            sx={{
                fontWeight: 600,
                borderRadius: 2,
            }}
        />
    );
};
