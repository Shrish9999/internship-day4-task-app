import React, { useState, useEffect, useContext, createContext } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion'; // <-- Animation Package

// --- Material UI Components ---
import { 
  Container, Typography, TextField, Button, Select, MenuItem, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  IconButton, Chip, Box, Grid, Card, CardContent, InputLabel, FormControl 
} from '@mui/material';

// --- Icons ---
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import UpdateIcon from '@mui/icons-material/Update';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIcon from '@mui/icons-material/Assignment';

import './App.css'; 

// --- GLASSMORPHISM STYLE OBJECT (Kaanch wala effect) ---
const glassStyle = {
  background: 'rgba(255, 255, 255, 0.65)', // Thoda transparent white
  backdropFilter: 'blur(12px)',            // Peeche ka blur
  borderRadius: '16px',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
};

// --- 1. Context Logic (SAME AS BEFORE) ---
const TodoContext = createContext();

const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem("myTodos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    localStorage.setItem("myTodos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (todo) => {
    setTodos([...todos, { id: Date.now(), ...todo }]);
    toast.success('Task added successfully!', { icon: '✨' });
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    toast.error('Task removed', { icon: '🗑️' });
  };

  const updateTodo = (id, updatedTodo) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, ...updatedTodo } : todo)));
    setEditData(null);
    toast.success('Task updated!', { icon: '🚀' });
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo, deleteTodo, updateTodo, editData, setEditData }}>
      {children}
    </TodoContext.Provider>
  );
};

// --- 2. Form Component (With Animation) ---
const TodoForm = () => {
  const { addTodo, updateTodo, editData, setEditData } = useContext(TodoContext);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('Medium');

  useEffect(() => {
    if (editData) {
      setTitle(editData.title);
      setDesc(editData.desc);
      setPriority(editData.priority);
    } else {
      setTitle('');
      setDesc('');
      setPriority('Medium');
    }
  }, [editData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !desc) return toast.error("Please fill all fields!");

    if (editData) {
      updateTodo(editData.id, { title, desc, priority });
    } else {
      addTodo({ title, desc, priority });
    }
    setTitle('');
    setDesc('');
    setPriority('Medium');
  };

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }} 
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ ...glassStyle, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {editData ? <EditIcon color="warning"/> : <AddCircleIcon color="primary"/>} 
            {editData ? "Edit Task" : "Create New Task"}
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={5}>
                <TextField 
                  fullWidth label="What needs to be done?" variant="outlined" size="small"
                  value={title} onChange={(e) => setTitle(e.target.value)} 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField 
                  fullWidth label="Description" variant="outlined" size="small"
                  value={desc} onChange={(e) => setDesc(e.target.value)} 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select value={priority} label="Priority" onChange={(e) => setPriority(e.target.value)}>
                    <MenuItem value="High" sx={{ color: 'red', fontWeight: 'bold' }}>🔥 High</MenuItem>
                    <MenuItem value="Medium" sx={{ color: 'orange' }}>⚡ Medium</MenuItem>
                    <MenuItem value="Low" sx={{ color: 'green' }}>☕ Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    fullWidth type="submit" variant="contained" 
                    sx={{ 
                      height: '40px', fontWeight: 'bold', 
                      background: editData ? 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
                    }}
                  >
                    {editData ? "Update" : "Add"}
                  </Button>
                </motion.div>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// --- 3. Table Component (With Staggered Animation) ---
const TodoTable = () => {
  const { todos, deleteTodo, setEditData } = useContext(TodoContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "All" || todo.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const getBadgeColor = (p) => {
    if (p === 'High') return 'error';
    if (p === 'Medium') return 'warning';
    return 'success';
  };

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }} 
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card sx={glassStyle}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentIcon sx={{ color: '#555' }}/> Your Tasks 
              <Chip label={filteredTodos.length} color="primary" size="small" sx={{ fontWeight: 'bold' }} />
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                size="small" placeholder="🔍 Search..." variant="outlined"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 }}
              />
              <FormControl size="small" sx={{ minWidth: 120, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 }}>
                <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} displayEmpty>
                  <MenuItem value="All">All Priorities</MenuItem>
                  <MenuItem value="High">🔥 High</MenuItem>
                  <MenuItem value="Medium">⚡ Medium</MenuItem>
                  <MenuItem value="Low">☕ Low</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {filteredTodos.length === 0 ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <Typography variant="h6">No tasks found! 🎉</Typography>
                <Typography variant="body2">Enjoy your free time or add a new task.</Typography>
             </motion.div>
          ) : (
            <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold', color: '#444', borderBottom: '2px solid rgba(0,0,0,0.1)' } }}>
                    <TableCell>Task</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {filteredTodos.map((todo) => (
                      <motion.tr
                        key={todo.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'table-row' }} // Fix for tr animation
                      >
                        <TableCell component="td" scope="row">
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{todo.title}</Typography>
                          <Typography variant="caption" color="textSecondary">{todo.desc}</Typography>
                        </TableCell>
                        <TableCell component="td" scope="row">
                          <Chip 
                            label={todo.priority} 
                            color={getBadgeColor(todo.priority)} 
                            size="small" 
                            variant={todo.priority === 'High' ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell component="td" align="right">
                          <motion.div whileHover={{ scale: 1.2 }} style={{ display: 'inline-block' }}>
                            <IconButton onClick={() => setEditData(todo)} color="primary">
                              <EditIcon />
                            </IconButton>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.2 }} style={{ display: 'inline-block' }}>
                            <IconButton onClick={() => deleteTodo(todo.id)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          </motion.div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// --- 4. Main App (Heading Animation) ---
function App() {
  return (
    <TodoProvider>
      <Toaster position="top-center" />
      <Container maxWidth="md" sx={{ mt: 8, mb: 5 }}>
        <motion.div 
          initial={{ y: -50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ type: "spring", stiffness: 120 }}
        >
          <Typography variant="h2" align="center" gutterBottom sx={{ 
            fontWeight: 800, 
            color: '#fff', 
            textShadow: '0px 4px 10px rgba(0,0,0,0.3)',
            fontFamily: "'Poppins', sans-serif",
            mb: 4
          }}>
            🚀 Task Master
          </Typography>
        </motion.div>
        
        <TodoForm />
        <TodoTable />
      </Container>
    </TodoProvider>
  );
}

export default App;