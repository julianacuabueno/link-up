import { Box, Typography, Avatar, AvatarGroup, Chip, IconButton, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import StarIcon from '@mui/icons-material/Star';

const AttendeeList = ({ attendees = [], onRemove, isOwner = false, maxVisible = 5, compact = false }) => {
  const acceptedAttendees = attendees.filter(a => a.status === 'accepted');
  const pendingAttendees = attendees.filter(a => a.status === 'pending');
  const declinedAttendees = attendees.filter(a => a.status === 'declined');

  const getInitials = (email, name) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email ? email[0].toUpperCase() : '?';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon sx={{ fontSize: 14, color: '#4caf50' }} />;
      case 'pending':
        return <PendingIcon sx={{ fontSize: 14, color: '#ff9800' }} />;
      case 'declined':
        return <CancelIcon sx={{ fontSize: 14, color: '#f44336' }} />;
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AvatarGroup max={maxVisible} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 12 } }}>
          {acceptedAttendees.map((attendee) => (
            <Tooltip key={attendee.id} title={attendee.name || attendee.email}>
              <Avatar sx={{ bgcolor: attendee.role === 'owner' ? '#4a90e2' : '#6b7280' }}>
                {getInitials(attendee.email, attendee.name)}
              </Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          {acceptedAttendees.length} attending
          {pendingAttendees.length > 0 && ` (${pendingAttendees.length} pending)`}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ color: '#374151', fontWeight: 600, mb: 2 }}>
        Attendees ({acceptedAttendees.length} attending)
      </Typography>

      {attendees.length === 0 ? (
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          No attendees yet. Invite people to this event!
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {attendees.map((attendee) => (
            <Box
              key={attendee.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                bgcolor: '#f9fafb',
                borderRadius: 1,
                border: '1px solid #e5e7eb'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: attendee.role === 'owner' ? '#4a90e2' : '#6b7280',
                    fontSize: 14
                  }}
                >
                  {getInitials(attendee.email, attendee.name)}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500 }}>
                      {attendee.name || attendee.email.split('@')[0]}
                    </Typography>
                    {attendee.role === 'owner' && (
                      <Tooltip title="Event Owner">
                        <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                      </Tooltip>
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    {attendee.email}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={getStatusIcon(attendee.status)}
                  label={attendee.status}
                  size="small"
                  sx={{
                    bgcolor: attendee.status === 'accepted' ? '#dcfce7' :
                             attendee.status === 'pending' ? '#fef3c7' : '#fee2e2',
                    color: attendee.status === 'accepted' ? '#166534' :
                           attendee.status === 'pending' ? '#92400e' : '#991b1b',
                    textTransform: 'capitalize',
                    '& .MuiChip-icon': { color: 'inherit' }
                  }}
                />
                {isOwner && attendee.role !== 'owner' && onRemove && (
                  <Tooltip title="Remove attendee">
                    <IconButton
                      size="small"
                      onClick={() => onRemove(attendee.id)}
                      sx={{ color: '#6b7280', '&:hover': { color: '#ef4444' } }}
                    >
                      <PersonRemoveIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {pendingAttendees.length > 0 && (
        <Typography variant="caption" sx={{ color: '#6b7280', mt: 1, display: 'block' }}>
          {pendingAttendees.length} invitation{pendingAttendees.length > 1 ? 's' : ''} pending
        </Typography>
      )}
    </Box>
  );
};

export default AttendeeList;
