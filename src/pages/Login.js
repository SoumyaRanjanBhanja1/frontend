import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import axios from 'axios';

export default function Login({ setUser }) {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post('http://localhost:5000/auth/login', form, { withCredentials: true });
    setUser(res.data.user);
    window.location.href = '/';
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4" gutterBottom>Login</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Email" fullWidth margin="normal" onChange={e => setForm({ ...form, email: e.target.value })} />
        <TextField label="Password" type="password" fullWidth margin="normal" onChange={e => setForm({ ...form, password: e.target.value })} />
        <Button type="submit" variant="contained" fullWidth>Login</Button>
      </form>
    </Container>
  );
}
