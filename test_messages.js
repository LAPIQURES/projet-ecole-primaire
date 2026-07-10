const axios = require('axios');

async function runTest() {
  const baseURL = 'http://localhost:5000/api';
  console.log('Testing messaging flow...');

  try {
    // 1. Authenticate as admin
    const authRes = await axios.post(`${baseURL}/auth/login`, {
      username: 'admin_root',
      password: 'password' // If this doesn't work we will use "piqure"
    });
    console.log('Login successful with admin_root');
  } catch (err) {
    console.error('Failed to login with admin_root, trying piqure...', err.message);
    try {
      const authRes2 = await axios.post(`${baseURL}/auth/login`, {
        username: 'piqure',
        password: '1234'
      });
      const token = authRes2.data.token;
      console.log('Login successful with piqure');
      
      // 2. Fetch contacts to find all actors
      const contactsRes = await axios.get(`${baseURL}/messages/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const contacts = contactsRes.data;
      console.log(`Found ${contacts.length} contacts.`);

      // 3. Send message to the first contact
      if (contacts.length > 0) {
        const firstContact = contacts[0];
        console.log(`Sending message to ${firstContact.role} - ${firstContact.id}`);
        const sendRes = await axios.post(`${baseURL}/messages`, {
          receiverRole: firstContact.role,
          receiverId: firstContact.id,
          content: 'Ceci est un message de test envoyé par le système automatisé.'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Message sent successfully!');
      }

      // 4. Check unread count
      const unreadRes = await axios.get(`${baseURL}/messages/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Unread messages count: ${unreadRes.data.unread}`);

    } catch (e) {
      console.error('Test failed completely:', e.message);
    }
  }
}

runTest();
