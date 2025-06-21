import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import axios from 'axios';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('https://frontend-psi-six-94.vercel.app/signup', form);
    window.location.href = '/login';
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4" gutterBottom>Signup</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Username" fullWidth margin="normal" onChange={e => setForm({ ...form, username: e.target.value })} />
        <TextField label="Email" fullWidth margin="normal" onChange={e => setForm({ ...form, email: e.target.value })} />
        <TextField label="Password" type="password" fullWidth margin="normal" onChange={e => setForm({ ...form, password: e.target.value })} />
        <Button type="submit" variant="contained" fullWidth>Signup</Button>
      </form>
    </Container>
  );
}
