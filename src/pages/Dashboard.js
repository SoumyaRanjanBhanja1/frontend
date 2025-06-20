import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container, Grid, Card, CardMedia, CardContent, Typography,
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';

const BACKEND = 'http://localhost:5000';
const YOUTUBE_API_KEY = 'AIzaSyCiQhr2kT4oH0ljdCEntagK-umjBYbJY0k'; // Replace with your real API key

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [editVideo, setEditVideo] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Fetch current user
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${BACKEND}/auth/me`, { withCredentials: true });
      setUser(res.data);
    } catch (err) {
      window.location.href = '/login';
    }
  };

  // Fetch all videos
  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${BACKEND}/videos`, { withCredentials: true });
      setVideos(res.data);
    } catch (err) {
      toast.error("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchVideos();
  }, []);

  const extractVideoId = (url) => {
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleAddVideo = async () => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return toast.error('Invalid YouTube URL');

    try {
      const ytRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet`);
      const { title, description, thumbnails } = ytRes.data.items[0].snippet;

      await axios.post(`${BACKEND}/videos/add`, {
        title,
        description,
        thumbnail: thumbnails.high.url,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`
      }, { withCredentials: true });

      toast.success('Video added successfully!');
      setVideoUrl('');
      fetchVideos();
    } catch (err) {
      toast.error('Failed to add video');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND}/videos/${id}`, { withCredentials: true });
      toast.success('Video deleted');
      fetchVideos();
    } catch (err) {
      toast.error('Error deleting video');
    }
  };

  const handleEdit = (video) => {
    setEditVideo(video);
    setOpenDialog(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${BACKEND}/videos/${editVideo._id}`, editVideo, { withCredentials: true });
      toast.success('Video updated');
      setOpenDialog(false);
      setEditVideo(null);
      fetchVideos();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const logout = () => {
    axios.get(`${BACKEND}/auth/logout`, { withCredentials: true })
      .then(() => window.location.href = '/login');
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>🎬 YouTube Dashboard</Typography>
      <Button variant="outlined" onClick={logout} sx={{ mb: 2 }}>Logout</Button>

      {user?.role === 'admin' && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <TextField
            label="YouTube Video URL"
            fullWidth
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <Button variant="contained" onClick={handleAddVideo}>Add Video</Button>
        </div>
      )}

      {loading ? (
        <CircularProgress sx={{ mt: 5 }} />
      ) : (
        <Grid container spacing={3}>
          {videos.map(video => (
            <Grid item xs={12} sm={6} md={4} key={video._id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={video.thumbnail}
                  alt={video.title}
                />
                <CardContent>
                  <Typography variant="h6">{video.title}</Typography>
                  <Typography variant="body2">{video.description}</Typography>
                </CardContent>
                {user?.role === 'admin' && (
                  <>
                    <Button onClick={() => handleEdit(video)} fullWidth>Edit</Button>
                    <Button onClick={() => handleDelete(video._id)} fullWidth color="error">Delete</Button>
                  </>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit Video</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={editVideo?.title || ''}
            onChange={(e) => setEditVideo({ ...editVideo, title: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={editVideo?.description || ''}
            onChange={(e) => setEditVideo({ ...editVideo, description: e.target.value })}
          />
          <TextField
            label="Thumbnail URL"
            fullWidth
            margin="normal"
            value={editVideo?.thumbnail || ''}
            onChange={(e) => setEditVideo({ ...editVideo, thumbnail: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
