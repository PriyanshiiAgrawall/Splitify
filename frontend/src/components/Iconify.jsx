import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import { Box } from '@mui/material';

Iconify.propTypes = {
    icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    sx: PropTypes.object,
};

export default function Iconify({ icon, width = 24, height = 24, sx, ...other }) {
    return (
        <Box
            component={Icon}
            icon={icon}
            sx={{ width, height, display: 'inline-flex', ...sx }}
            {...other}
        />
    );
}
