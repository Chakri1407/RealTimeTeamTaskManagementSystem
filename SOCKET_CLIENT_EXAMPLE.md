# Socket.IO Client Integration Guide

## Connection Setup

### JavaScript/TypeScript Client

```javascript
import { io } from 'socket.io-client';

// Connect with authentication
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-access-token'
  },
  transports: ['websocket', 'polling']
});

// Connection events
socket.on('connected', (data) => {
  console.log('Connected to server:', data);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

## Joining Rooms

### Join a Team Room
```javascript
// Join team room to receive team-related events
socket.emit('join:team', 'team-id-here');

// Leave team room
socket.emit('leave:team', 'team-id-here');
```

### Join a Project Room
```javascript
// Join project room to receive project and task events
socket.emit('join:project', 'project-id-here');

// Leave project room
socket.emit('leave:project', 'project-id-here');
```

### Subscribe to Task Updates
```javascript
// Subscribe to specific task updates
socket.emit('subscribe:task', 'task-id-here');

// Unsubscribe from task updates
socket.emit('unsubscribe:task', 'task-id-here');
```

## Listening to Events

### Team Events
```javascript
socket.on('team:created', (data) => {
  console.log('Team created:', data);
});

socket.on('team:updated', (data) => {
  console.log('Team updated:', data);
});

socket.on('team:deleted', (data) => {
  console.log('Team deleted:', data);
});

socket.on('team:member:added', (data) => {
  console.log('Member added:', data);
});

socket.on('team:member:removed', (data) => {
  console.log('Member removed:', data);
});

socket.on('team:member:role:changed', (data) => {
  console.log('Member role changed:', data);
});
```

### Project Events
```javascript
socket.on('project:created', (data) => {
  console.log('Project created:', data);
});

socket.on('project:updated', (data) => {
  console.log('Project updated:', data);
});

socket.on('project:deleted', (data) => {
  console.log('Project deleted:', data);
});
```

### Task Events
```javascript
socket.on('task:created', (data) => {
  console.log('Task created:', data);
  // data: { taskId, taskTitle, projectId, teamId, userId, userName, status, priority, timestamp }
});

socket.on('task:updated', (data) => {
  console.log('Task updated:', data);
});

socket.on('task:deleted', (data) => {
  console.log('Task deleted:', data);
});

socket.on('task:status:changed', (data) => {
  console.log('Task status changed:', data);
  // data: { taskId, taskTitle, status, previousStatus, ... }
});

socket.on('task:assigned', (data) => {
  console.log('Task assigned:', data);
  // data: { taskId, taskTitle, assigneeId, assigneeName, ... }
});

socket.on('task:unassigned', (data) => {
  console.log('Task unassigned:', data);
});
```

### Notification Events
```javascript
socket.on('notification', (data) => {
  console.log('Notification:', data);
  // data: { type: 'info'|'success'|'warning'|'error', title, message, data?, timestamp }
  
  // Show toast notification in your UI
  showToast(data.type, data.title, data.message);
});
```

### Activity Log Events
```javascript
socket.on('activity:log', (data) => {
  console.log('Activity:', data);
  // data: { action, description, userId, userName, teamId?, projectId?, taskId?, timestamp }
});
```

## React Hook Example

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (token: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(process.env.REACT_APP_API_URL!, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connected', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  const joinTeam = (teamId: string) => {
    socket?.emit('join:team', teamId);
  };

  const leaveTeam = (teamId: string) => {
    socket?.emit('leave:team', teamId);
  };

  const joinProject = (projectId: string) => {
    socket?.emit('join:project', projectId);
  };

  const leaveProject = (projectId: string) => {
    socket?.emit('leave:project', projectId);
  };

  return {
    socket,
    isConnected,
    joinTeam,
    leaveTeam,
    joinProject,
    leaveProject
  };
};
```

## Event Payload Types

### TeamEventPayload
```typescript
interface TeamEventPayload {
  teamId: string;
  teamName: string;
  userId?: string;
  userName?: string;
  role?: string;
  timestamp: Date;
}
```

### ProjectEventPayload
```typescript
interface ProjectEventPayload {
  projectId: string;
  projectName: string;
  teamId: string;
  userId: string;
  userName: string;
  status?: string;
  timestamp: Date;
}
```

### TaskEventPayload
```typescript
interface TaskEventPayload {
  taskId: string;
  taskTitle: string;
  projectId: string;
  teamId: string;
  userId: string;
  userName: string;
  assigneeId?: string;
  assigneeName?: string;
  status?: string;
  previousStatus?: string;
  priority?: string;
  timestamp: Date;
}
```

### NotificationPayload
```typescript
interface NotificationPayload {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
}
```

## Client Events Reference

| Event | Direction | Description |
|-------|-----------|-------------|
| `join:team` | Client → Server | Join a team room |
| `leave:team` | Client → Server | Leave a team room |
| `join:project` | Client → Server | Join a project room |
| `leave:project` | Client → Server | Leave a project room |
| `subscribe:task` | Client → Server | Subscribe to task updates |
| `unsubscribe:task` | Client → Server | Unsubscribe from task updates |

## Server Events Reference

| Event | Direction | Description |
|-------|-----------|-------------|
| `connected` | Server → Client | Connection successful |
| `error` | Server → Client | Error occurred |
| `team:created` | Server → Client | Team was created |
| `team:updated` | Server → Client | Team was updated |
| `team:deleted` | Server → Client | Team was deleted |
| `team:member:added` | Server → Client | Member added to team |
| `team:member:removed` | Server → Client | Member removed from team |
| `team:member:role:changed` | Server → Client | Member role changed |
| `project:created` | Server → Client | Project was created |
| `project:updated` | Server → Client | Project was updated |
| `project:deleted` | Server → Client | Project was deleted |
| `task:created` | Server → Client | Task was created |
| `task:updated` | Server → Client | Task was updated |
| `task:deleted` | Server → Client | Task was deleted |
| `task:status:changed` | Server → Client | Task status changed |
| `task:assigned` | Server → Client | Task was assigned |
| `task:unassigned` | Server → Client | Task was unassigned |
| `notification` | Server → Client | Direct notification |
| `activity:log` | Server → Client | Activity log event |

