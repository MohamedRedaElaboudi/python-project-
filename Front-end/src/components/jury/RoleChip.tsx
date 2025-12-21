import React from 'react';
import { Chip, Avatar } from '@mui/material';
import { Star, Person, Gavel } from '@mui/icons-material';

interface RoleChipProps {
    role: 'president' | 'member' | 'rapporteur' | string;
    size?: 'small' | 'medium';
}

export const RoleChip: React.FC<RoleChipProps> = ({ role, size = 'small' }) => {
    const getConfig = () => {
        // Safety check for undefined/null role
        if (!role) {
            return {
                label: 'Membre',
                color: 'default' as const,
                icon: <Person fontSize="small" />,
            };
        }

        const normalizedRole = role.toLowerCase();

        switch (normalizedRole) {
            case 'president':
                return {
                    label: 'Président',
                    color: 'primary' as const,
                    icon: <Star fontSize="small" />,
                };
            case 'rapporteur':
                return {
                    label: 'Rapporteur',
                    color: 'secondary' as const,
                    icon: <Gavel fontSize="small" />,
                };
            case 'member':
            default:
                return {
                    label: 'Membre',
                    color: 'default' as const,
                    icon: <Person fontSize="small" />,
                };
        }
    };

    const config = getConfig();

    return (
        <Chip
            avatar={<Avatar sx={{ bgcolor: 'transparent' }}>{config.icon}</Avatar>}
            label={config.label}
            color={config.color}
            size={size}
            variant="outlined"
            sx={{
                fontWeight: 600,
                borderRadius: 2,
            }}
        />
    );
};
