import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import SendIcon from '@mui/icons-material/Send';

const InviteDialog = ({ open, onClose, eventId, eventTitle, shareToken }) => {
  const [tab, setTab] = useState(0);
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const shareUrl = `${window.location.origin}/invite/${shareToken}`;

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (email && email.includes('@') && !emails.includes(email)) {
      setEmails([...emails, email]);
      setEmailInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmails(emails.filter(e => e !== emailToRemove));
  };

  const handleSendInvites = async () => {
    if (emails.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/calendar/events/${eventId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails })
      });

      const data = await response.json();

      if (data.success) {
        setSnackbar({
          open: true,
          message: `Invited ${data.invited} people successfully!`,
          severity: 'success'
        });
        setEmails([]);
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'Failed to send invitations',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error sending invites:', error);
      setSnackbar({
        open: true,
        message: 'Failed to send invitations',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setSnackbar({
        open: true,
        message: 'Link copied to clipboard!',
        severity: 'success'
      });
    } catch (error) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setSnackbar({
        open: true,
        message: 'Link copied to clipboard!',
        severity: 'success'
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join: ${eventTitle}`,
          text: `You're invited to ${eventTitle}!`,
          url: shareUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Invite People
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
            Invite friends to "{eventTitle}"
          </Typography>

          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="By Email" />
            <Tab label="Share Link" />
          </Tabs>

          {tab === 0 && (
            <Box>
              <TextField
                fullWidth
                placeholder="Enter email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={handleAddEmail}
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={handleAddEmail}
                      disabled={!emailInput.trim()}
                      size="small"
                      sx={{ minWidth: 'auto' }}
                    >
                      Add
                    </Button>
                  )
                }}
              />

              {emails.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {emails.map((email) => (
                    <Chip
                      key={email}
                      label={email}
                      onDelete={() => handleRemoveEmail(email)}
                      size="small"
                      sx={{ bgcolor: '#e5e7eb' }}
                    />
                  ))}
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={handleSendInvites}
                disabled={emails.length === 0 || loading}
                startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
                sx={{
                  bgcolor: '#4a90e2',
                  '&:hover': { bgcolor: '#357abd' },
                  textTransform: 'none'
                }}
              >
                {loading ? 'Sending...' : `Send Invite${emails.length > 1 ? 's' : ''}`}
              </Button>
            </Box>
          )}

          {tab === 1 && (
            <Box>
              <Typography variant="body2" sx={{ color: '#374151', mb: 2 }}>
                Share this link with anyone to invite them to the event:
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  bgcolor: '#f3f4f6',
                  borderRadius: 1,
                  mb: 2
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    flexGrow: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: '#374151'
                  }}
                >
                  {shareUrl}
                </Typography>
                <IconButton onClick={handleCopyLink} size="small" sx={{ color: '#4a90e2' }}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleCopyLink}
                  startIcon={<ContentCopyIcon />}
                  sx={{
                    borderColor: '#4a90e2',
                    color: '#4a90e2',
                    textTransform: 'none',
                    '&:hover': { borderColor: '#357abd', bgcolor: 'rgba(74, 144, 226, 0.1)' }
                  }}
                >
                  Copy Link
                </Button>
                {navigator.share && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleNativeShare}
                    startIcon={<ShareIcon />}
                    sx={{
                      bgcolor: '#4a90e2',
                      '&:hover': { bgcolor: '#357abd' },
                      textTransform: 'none'
                    }}
                  >
                    Share
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={onClose} sx={{ color: '#6b7280', textTransform: 'none' }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default InviteDialog;
