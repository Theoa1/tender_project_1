'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Chip,
  Button,
  IconButton,
  Box,
  Tabs,
  Tab,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import LogoutIcon from '@mui/icons-material/Logout';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import { friendlyError } from '@/lib/friendly';

type Booking = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  service: string;
  preferredDate: string;
  preferredTime: string;
  message: string | null;
  status: string;
  createdAt: string;
};

type Me = { id: string; email: string; role: 'owner' | 'admin' | 'viewer' };

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
type Status = (typeof STATUSES)[number];

const COLORS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  pending: 'warning',
  confirmed: 'primary',
  completed: 'success',
  cancelled: 'error',
};

const SERVICES = [
  '30-min Quick Chat',
  '60-min Full Consultation',
  'Monthly Support Plan',
  'Sleep & Routine Coaching',
  'Behavior Guidance',
  'New Parent Coaching',
];

const TIMES = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '6:00 PM',
  '7:00 PM',
];

export default function AdminDashboard({
  initialBookings,
  me,
}: {
  initialBookings: Booking[];
  me: Me | null;
}) {
  const router = useRouter();
  const [section, setSection] = React.useState<'bookings' | 'admins' | 'settings'>('bookings');
  const [bookings, setBookings] = React.useState<Booking[]>(initialBookings);
  const [tab, setTab] = React.useState<'all' | Status>('all');
  const [query, setQuery] = React.useState('');
  const [editing, setEditing] = React.useState<Booking | null>(null);
  const [snack, setSnack] = React.useState<{ msg: string; severity: 'success' | 'error' } | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const canManageAdmins = me?.role === 'owner' || me?.role === 'admin';

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { all: bookings.length };
    STATUSES.forEach((s) => (c[s] = bookings.filter((b) => b.status === s).length));
    return c;
  }, [bookings]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (tab !== 'all' && b.status !== tab) return false;
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        (b.email || '').toLowerCase().includes(q) ||
        (b.phone || '').includes(q) ||
        b.service.toLowerCase().includes(q)
      );
    });
  }, [bookings, tab, query]);

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Update failed');
      const updated = data.booking as Omit<Booking, 'preferredDate' | 'createdAt'> & {
        preferredDate: string;
        createdAt: string;
      };
      setBookings((bs) =>
        bs.map((b) =>
          b.id === id
            ? {
                ...b,
                ...updated,
                preferredDate: new Date(updated.preferredDate).toISOString(),
                createdAt: new Date(updated.createdAt).toISOString(),
              }
            : b
        )
      );
      setSnack({ msg: 'Booking updated', severity: 'success' });
    } catch (e: unknown) {
      setSnack({ msg: friendlyError(e, 'We couldn’t update that booking. Please try again.'), severity: 'error' });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this booking? This cannot be undone.')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setBookings((bs) => bs.filter((b) => b.id !== id));
      setSnack({ msg: 'Booking deleted', severity: 'success' });
    } catch (e: unknown) {
      setSnack({ msg: friendlyError(e, 'We couldn’t delete that booking. Please try again.'), severity: 'error' });
    } finally {
      setBusyId(null);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <>
      <Tabs
        value={section}
        onChange={(_, v) => setSection(v)}
        sx={{ mb: 3 }}
      >
        <Tab value="bookings" label="Bookings" />
        <Tab value="admins" label="Admins" />
        <Tab value="settings" label="Settings" />
      </Tabs>

      {section === 'bookings' && (
        <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <TextField
          placeholder="Search name, email, phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="small"
          sx={{ maxWidth: 360 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Button startIcon={<LogoutIcon />} onClick={logout} color="inherit">
          Logout
        </Button>
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: '1px solid rgba(123,91,197,0.12)' }}
      >
        <Tab value="all" label={`All · ${counts.all}`} />
        {STATUSES.map((s) => (
          <Tab key={s} value={s} label={`${cap(s)} · ${counts[s] || 0}`} />
        ))}
      </Tabs>

      {filtered.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No bookings to show.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((b) => (
            <Grid item xs={12} md={6} lg={4} key={b.id}>
              <BookingCard
                b={b}
                busy={busyId === b.id}
                onAccept={() => patch(b.id, { status: 'confirmed' })}
                onCancel={() => patch(b.id, { status: 'cancelled' })}
                onComplete={() => patch(b.id, { status: 'completed' })}
                onEdit={() => setEditing(b)}
                onDelete={() => remove(b.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

        </>
      )}

      {section === 'admins' && me && (
        <AdminsPanel
          me={me}
          canManage={canManageAdmins}
          onNotify={(msg, severity) => setSnack({ msg, severity })}
        />
      )}

      {section === 'settings' && me && (
        <SettingsPanel onNotify={(msg, severity) => setSnack({ msg, severity })} />
      )}

      <EditDialog
        booking={editing}
        onClose={() => setEditing(null)}
        onSave={async (id, body) => {
          await patch(id, body);
          setEditing(null);
        }}
      />

      <Snackbar
        open={!!snack}
        autoHideDuration={3500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snack ? (
          <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(null)}>
            {snack.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}

function cap(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}

function BookingCard({
  b,
  busy,
  onAccept,
  onCancel,
  onComplete,
  onEdit,
  onDelete,
}: {
  b: Booking;
  busy: boolean;
  onAccept: () => void;
  onCancel: () => void;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card sx={{ height: '100%', position: 'relative', opacity: busy ? 0.6 : 1, transition: 'opacity .15s' }}>
      {busy && (
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          <CircularProgress size={16} />
        </Box>
      )}
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 1.5 }}>
          <Avatar sx={{ background: 'linear-gradient(135deg,#7B5BC5,#3FC1B0)' }}>
            {b.name[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              {b.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={b.status} color={COLORS[b.status] || 'default'} size="small" />
              <Typography color="text.secondary" sx={{ fontSize: 13 }} noWrap>
                {b.service}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Stack spacing={0.8} sx={{ fontSize: 14, color: 'text.secondary', mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <EventIcon fontSize="small" />
            <span>
              {new Date(b.preferredDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <AccessTimeIcon fontSize="small" sx={{ ml: 1 }} />
            <span>{b.preferredTime}</span>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <EmailIcon fontSize="small" />
            {b.email ? (
              <Tooltip title={b.email}>
                <Box
                  component="a"
                  href={`mailto:${b.email}`}
                  sx={{
                    color: 'inherit',
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {b.email}
                </Box>
              </Tooltip>
            ) : (
              <span style={{ opacity: 0.5 }}>—</span>
            )}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <PhoneIcon fontSize="small" />
            {b.phone ? (
              <Box
                component="a"
                href={`tel:${b.phone}`}
                sx={{
                  color: 'inherit',
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {b.phone}
              </Box>
            ) : (
              <span style={{ opacity: 0.5 }}>—</span>
            )}
          </Stack>
          {b.message && (
            <Box sx={{ mt: 1, p: 1.5, bgcolor: '#faf8ff', borderRadius: 2, color: 'text.primary' }}>
              {b.message}
            </Box>
          )}
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {b.status !== 'confirmed' && b.status !== 'completed' && (
            <Button size="small" variant="contained" color="primary" startIcon={<CheckIcon />} onClick={onAccept} disabled={busy}>
              Accept
            </Button>
          )}
          {b.status === 'confirmed' && (
            <Button size="small" variant="contained" color="success" startIcon={<DoneAllIcon />} onClick={onComplete} disabled={busy}>
              Mark done
            </Button>
          )}
          {b.status !== 'cancelled' && (
            <Button size="small" variant="outlined" color="error" startIcon={<CloseIcon />} onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <IconButton size="small" onClick={onEdit} disabled={busy} aria-label="Edit booking">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onDelete} disabled={busy} aria-label="Delete booking">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}

function EditDialog({
  booking,
  onClose,
  onSave,
}: {
  booking: Booking | null;
  onClose: () => void;
  onSave: (id: string, body: Record<string, unknown>) => Promise<void>;
}) {
  const [form, setForm] = React.useState({
    service: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
    status: 'pending' as Status,
    notify: true,
  });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (booking) {
      setForm({
        service: booking.service,
        preferredDate: new Date(booking.preferredDate).toISOString().slice(0, 10),
        preferredTime: booking.preferredTime,
        message: booking.message || '',
        status: booking.status as Status,
        notify: true,
      });
    }
  }, [booking]);

  if (!booking) return null;

  return (
    <Dialog open={!!booking} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit booking — {booking.name}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            select
            label="Status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}
            fullWidth
          >
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {cap(s)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Service"
            value={form.service}
            onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
            fullWidth
          >
            {Array.from(new Set([...SERVICES, form.service])).map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              type="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={form.preferredDate}
              onChange={(e) => setForm((f) => ({ ...f, preferredDate: e.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="Time"
              value={form.preferredTime}
              onChange={(e) => setForm((f) => ({ ...f, preferredTime: e.target.value }))}
              fullWidth
            >
              {Array.from(new Set([...TIMES, form.preferredTime])).map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField
            label="Notes / message"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            multiline
            minRows={3}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.notify}
                onChange={(e) => setForm((f) => ({ ...f, notify: e.target.checked }))}
              />
            }
            label="Notify the client by email & SMS if status changes"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={async () => {
            setSaving(true);
            try {
              await onSave(booking.id, form);
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ===================================================================
// Admins panel
// ===================================================================

type AdminRow = {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'viewer';
  status: 'active' | 'invited' | 'expired';
  createdAt: string;
};

function AdminsPanel({
  me,
  canManage,
  onNotify,
}: {
  me: Me;
  canManage: boolean;
  onNotify: (msg: string, severity: 'success' | 'error') => void;
}) {
  const [admins, setAdmins] = React.useState<AdminRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [inviting, setInviting] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<'admin' | 'viewer'>('admin');
  const [inviteLink, setInviteLink] = React.useState<string | null>(null);
  const [changePwOpen, setChangePwOpen] = React.useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admins');
      const data = await res.json();
      setAdmins(data.admins || []);
    } finally {
      setLoading(false);
    }
  }
  React.useEffect(() => {
    load();
  }, []);

  async function invite() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      onNotify('Enter a valid email.', 'error');
      return;
    }
    setInviting(true);
    setInviteLink(null);
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Invite failed');
      onNotify('Invite sent.', 'success');
      setInviteLink(data.inviteLink);
      setInviteEmail('');
      load();
    } catch (e: unknown) {
      onNotify(friendlyError(e, 'We couldn’t send that invite. Please try again.'), 'error');
    } finally {
      setInviting(false);
    }
  }

  async function remove(a: AdminRow) {
    if (a.role === 'owner') return;
    if (!confirm(`Remove ${a.email}?`)) return;
    try {
      const res = await fetch(`/api/admins/${a.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Remove failed');
      onNotify('Admin removed.', 'success');
      load();
    } catch (e: unknown) {
      onNotify(friendlyError(e, 'We couldn’t remove that admin. Please try again.'), 'error');
    }
  }

  async function changeRole(a: AdminRow, role: 'admin' | 'viewer') {
    try {
      const res = await fetch(`/api/admins/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Update failed');
      onNotify('Role updated.', 'success');
      load();
    } catch (e: unknown) {
      onNotify(friendlyError(e, 'We couldn’t change that role. Please try again.'), 'error');
    }
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ md: 'center' }}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5">Admin team</Typography>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            Owners and admins can manage bookings and invite other admins. Viewers have read-only access.
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => setChangePwOpen(true)}>
          Change my password
        </Button>
      </Stack>

      {canManage && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Invite a new admin
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                select
                label="Role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'admin' | 'viewer')}
                size="small"
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="admin">Full admin</MenuItem>
                <MenuItem value="viewer">Viewer (read-only)</MenuItem>
              </TextField>
              <Button
                variant="contained"
                onClick={invite}
                disabled={inviting}
                startIcon={inviting ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Send invite
              </Button>
            </Stack>
            {inviteLink && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Invite link (share if email didn&apos;t arrive):
                <Box sx={{ wordBreak: 'break-all', mt: 0.5, fontSize: 13 }}>{inviteLink}</Box>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Stack divider={<Box sx={{ borderTop: '1px solid rgba(0,0,0,0.06)' }} />}>
              {admins.map((a) => (
                <Stack
                  key={a.id}
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems={{ sm: 'center' }}
                  justifyContent="space-between"
                  sx={{ p: 2.5 }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ background: 'linear-gradient(135deg,#7B5BC5,#3FC1B0)' }}>
                      {a.email[0]?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={600}>
                        {a.email}
                        {a.id === me.id && (
                          <Chip label="You" size="small" sx={{ ml: 1 }} />
                        )}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Chip
                          size="small"
                          label={a.role}
                          color={a.role === 'owner' ? 'primary' : a.role === 'admin' ? 'secondary' : 'default'}
                        />
                        {a.status !== 'active' && (
                          <Chip
                            size="small"
                            label={a.status === 'invited' ? 'Invite pending' : 'Invite expired'}
                            color={a.status === 'invited' ? 'warning' : 'error'}
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                  {canManage && a.role !== 'owner' && a.id !== me.id && (
                    <Stack direction="row" spacing={1}>
                      <TextField
                        select
                        size="small"
                        value={a.role}
                        onChange={(e) => changeRole(a, e.target.value as 'admin' | 'viewer')}
                        sx={{ minWidth: 140 }}
                      >
                        <MenuItem value="admin">Full admin</MenuItem>
                        <MenuItem value="viewer">Viewer</MenuItem>
                      </TextField>
                      <IconButton onClick={() => remove(a)} aria-label="Remove admin" color="error">
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Stack>
                  )}
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <ChangePasswordDialog
        open={changePwOpen}
        onClose={() => setChangePwOpen(false)}
        myId={me.id}
        onNotify={onNotify}
      />
    </Box>
  );
}

function ChangePasswordDialog({
  open,
  onClose,
  myId,
  onNotify,
}: {
  open: boolean;
  onClose: () => void;
  myId: string;
  onNotify: (msg: string, severity: 'success' | 'error') => void;
}) {
  const [pw, setPw] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setPw('');
      setConfirm('');
    }
  }, [open]);

  async function save() {
    if (pw.length < 8) {
      onNotify('Password must be at least 8 characters.', 'error');
      return;
    }
    if (pw !== confirm) {
      onNotify('Passwords do not match.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admins/${myId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed');
      onNotify('Password updated.', 'success');
      onClose();
    } catch (e: unknown) {
      onNotify(friendlyError(e, 'We couldn’t update your password. Please try again.'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Change your password</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            type="password"
            label="New password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="new-password"
            fullWidth
          />
          <TextField
            type="password"
            label="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={save}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ===================================================================
// Settings panel
// ===================================================================

function SettingsPanel({
  onNotify,
}: {
  onNotify: (msg: string, severity: 'success' | 'error') => void;
}) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [notifyEmail, setNotifyEmail] = React.useState('');

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setNotifyEmail(data.notifyEmail || '');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail)) {
      onNotify('Enter a valid email.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifyEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Save failed');
      onNotify('Settings saved.', 'success');
    } catch (e: unknown) {
      onNotify(friendlyError(e, 'We couldn’t save your settings. Please try again.'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        Settings
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, fontSize: 14 }}>
        Where new-booking alerts are sent.
      </Typography>
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : (
            <Stack spacing={2}>
              <TextField
                label="Owner notification email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                type="email"
                fullWidth
                helperText="Every new booking will be emailed here."
              />
              <Stack direction="row" justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={save}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  Save
                </Button>
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
