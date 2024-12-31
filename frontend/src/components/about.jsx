import React from 'react';
import { Typography, Box, Container } from '@mui/material';
import Copyright from './Copyright';

const About = () => {
  return (
    <Container
      maxWidth="md"
      sx={{
        bgcolor: 'background.paper',
        boxShadow: 2,
        my: 10,
        py: 10,
      }}
    >
      <Box textAlign="center">

        <Typography variant="h4" component="h2" sx={{ my: 2 }}>
          Splitify!
        </Typography>
        <Typography>
          Built with MongoDB, Express, React, and Node.js (MERN Stack)
        </Typography>
        <Box mt={3}>
          <a href="https://github.com/PriyanshiiAgrawall/Splitify/issues">Report Bug</a> &nbsp;|&nbsp;
          <a href="https://github.com/PriyanshiiAgrawall/Splitify/issues">Request Feature</a>
        </Box>
        <Copyright />
      </Box>

      <Typography variant="h5" sx={{ mt: 5 }}>
        About Splitify
      </Typography>
      <Typography paragraph sx={{ mt: 2 }}>
        Splitify is a full-stack expense management application built using the MERN stack (MongoDB, Express, React, and Node.js).
        It is designed to make group expense tracking and settlement easy, whether for friends or other collaborative purposes.
      </Typography>

      <Typography variant="h6" sx={{ mt: 4 }} id="key-features">
        Key Features
      </Typography>
      <ul>
        <li>Create and manage user groups for tracking group expenses.</li>
        <li>Addition of expenses and inclusion of who are the members contributing to expense among group</li>
        <li>Editing profile details, changing password and deletion of accout functionality provided</li>
        <li>Personalized settlement options for shared expenses.</li>
        <li>Analytics with expenditure trends and category-wise graphs.</li>
        <li>Track daily, monthly, and yearly expenses with ease.</li>
        <li>Quick and handy expense addition and deletion.</li>
        <li>Graphical representation of user expenditure trends.</li>
        <li>Algorithm for minimum transactions during settlements.</li>
        <li>Secure user authentication using JWT.</li>
        <li>Responsive and intuitive user interface for all devices.</li>
        <li>Handles edge cases like zero members in groups or expenses and member removal without settlement.</li>
        <li>Automatic adjustments for group splits when members are added.</li>
      </ul>

      <Typography variant="h6" sx={{ mt: 4 }} id="technologies-used">
        Technologies Used
      </Typography>
      <Typography variant="h6" sx={{ mt: 4 }} id="frontend">Frontend</Typography>
      <ul>
        <li><strong>Framework:</strong> React (18.x)</li>
        <li><strong>State Management:</strong> React Hook Form and Zod for form validation</li>
        <li><strong>UI Components:</strong> Material-UI (MUI), including Lab and Icons</li>
        <li><strong>Routing:</strong> React Router (7.x)</li>
        <li><strong>Charts:</strong> Chart.js and React-ChartJS-2 for data visualization</li>
        <li><strong>HTTP Requests/API communication:</strong> Axios</li>
        <li><strong>Data Formatting:</strong> date-fns for date handling</li>
        <li><strong>Custom Features:</strong> React Avatar for profile pictures</li>


      </ul>
      <Typography variant="h6" sx={{ mt: 4 }} id="backend">Backend</Typography>
      <ul>

        <li><strong>Framework:</strong> Node.js</li>
        <li><strong>Server:</strong> Express.js</li>
        <li><strong>Database:</strong> MongoDB with Mongoose for schema modeling</li>
        <li><strong>Authentication:</strong> JWT (JSON Web Token)</li>
        <li><strong>Security:</strong> bcrypt.js for password hashing</li>
        <li><strong>Environment Management:</strong> dotenv for configuration</li>
        <li><strong>Logging:</strong> Morgan and Winston for request and application logging</li>
        <li><strong>Development:</strong> Nodemon for automatic server restarts during development</li>

      </ul>
      <Typography variant="subtitle1">Database</Typography>
      <ul>
        <li>MongoDB</li>
      </ul>

      <Typography variant="h6" sx={{ mt: 4 }} id="configuration-and-setup">
        Configuration and Setup
      </Typography>
      <Typography paragraph>
        To run this project locally:
      </Typography>
      <ul>
        <li>Clone the repository or download it as a zip file.</li>
        <li>Install dependencies for both client and server.</li>
        <li>Create a `.env` file in the backend directory and provide the required configuration details such as MongoDB URI, JWT secret and PORT.</li>
      </ul>
      <Typography paragraph>
        Use the following commands in your terminal:
      </Typography>
      <Box sx={{ bgcolor: '#f0f0f0', p: 2, borderRadius: 1 }}>
        <code>
          cd frontend <br />
          npm install <br />
          npm run start <br />
          <br />
          cd backend <br />
          npm install <br />
          npm run start
        </code>
      </Box>

      <Typography variant="h6" sx={{ mt: 4 }} id="license">
        License
      </Typography>
      <Typography paragraph>
      </Typography>
      <Typography paragraph>
        Permission is granted to use, copy, modify, and distribute this software for any purpose, provided that the above copyright notice and this permission notice appear in all copies.
      </Typography>

      <Box mt={3}>
        <Copyright />
      </Box>
    </Container>
  );
};

export default About;
//future additions 
//search expenses / groups
//premium feature 
//currency conversion 
//email otp sending and verifying 
//leave group option
//profile picture setting with cloudfare
