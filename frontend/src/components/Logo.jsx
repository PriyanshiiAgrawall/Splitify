import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box } from '@mui/material';
import configData from '../config.json'
import splitify from "../assets/splitify.png"


// ----------------------------------------------------------------------

Logo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
};

export default function Logo({ disabledLink = false, sx }) {


  const logo = (
    <Box sx={{ width: 60, height: 60, ...sx }}>
      <img src={splitify} />
    </Box>
  );

  if (disabledLink) {
    return <>{logo}</>;
  }

  return <RouterLink to={configData.DASHBOARD_URL}>{logo}</RouterLink>;
}