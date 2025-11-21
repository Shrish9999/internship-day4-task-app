import React, { useState, useEffect, useContext, createContext, useReducer, useMemo, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// --- Material UI Components ---
import { 
  Container, Typography, TextField, Button, Select, MenuItem, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  IconButton, Chip, Box, Grid, Card, CardContent, InputLabel, FormControl, Tooltip
} from '@mui/material';

// --- Icons ---
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import FilterListIcon from '@mui/icons-material/FilterList';

import './App.css'; 

// =================================================================
// [REQUIREMENT 2: useContext] 
// Yahan hum Global Theme Context bana rahe hain taaki Light/Dark mode
// poore app mein access ho sake.
// =================================================================
const ThemeContext = createContext();

// =================================================================
// [REQUIREMENT 3: useReducer]
// Task list ko manage karne ke liye Reducer function.
// Yeh 'useState' se behtar hai kyunki hum actions (ADD, REMOVE, TOGGLE) define kar sakte hain.
// =================================================================
const todoReducer = (state, action) => {
  switch (action.type) {
    case 'INIT_TASKS': return action.payload;
    case 'ADD_TASK': return [...state, action.payload]; // Task add karne ka logic
    case 'REMOVE_TASK': return state.filter((todo) => todo.id !== action.payload); // Task delete karne ka logic
    case 'TOGGLE_TASK': return state.map((todo) => todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo); // Task complete mark karne ka logic
    case 'UPDATE_TASK': return state.map((todo) => todo.id === action.payload.id ? { ...todo, ...action.payload.updatedTodo } : todo);
    default: return state;
  }
};

const TodoContext = createContext();

const TodoProvider = ({ children }) => {
  // [REQUIREMENT 3: useReducer Implementation]
  // Yahan humne useState ki jagah useReducer use kiya tasks manage karne ke liye.
  const [todos, dispatch] = useReducer(todoReducer, [], () => {
    // [REQUIREMENT 6: Persistence]
    // Initial load pe LocalStorage se data utha rahe hain.
    const savedTodos = localStorage.getItem("myTodos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  
  const [editData, setEditData] = useState(null);

  // [REQUIREMENT 6: Persistence with useEffect]
  // Jab bhi 'todos' change honge, yeh LocalStorage mein save ho jayega.
  useEffect(() => { localStorage.setItem("myTodos", JSON.stringify(todos)); }, [todos]);

  // [REQUIREMENT 5: useCallback]
  // Functions ko memoize kiya hai taaki jab yeh child components mein pass hon,
  // toh woh bina wajah re-render na hon (Performance Optimization).
  const addTodo = useCallback((todo) => {
    dispatch({ type: 'ADD_TASK', payload: { id: Date.now(), completed: false, ...todo } });
    toast.success('Task Added', { style: { borderRadius: '10px', background: '#333', color: '#fff' } });
  }, []);

  const deleteTodo = useCallback((id) => {
    dispatch({ type: 'REMOVE_TASK', payload: id });
    toast.error('Task Deleted', { style: { borderRadius: '10px', background: '#333', color: '#fff' } });
  }, []);

  const toggleTodo = useCallback((id) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id });
  }, []);

  const updateTodo = useCallback((id, updatedTodo) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updatedTodo } });
    setEditData(null);
    toast.success('Task Updated', { style: { borderRadius: '10px', background: '#333', color: '#fff' } });
  }, []);

  return (
    <TodoContext.Provider value={{ todos, addTodo, deleteTodo, toggleTodo, updateTodo, editData, setEditData }}>
      {children}
    </TodoContext.Provider>
  );
};

// =================================================================
// UI COMPONENTS
// =================================================================

// --- Form Component ---
const TodoForm = () => {
  const { addTodo, updateTodo, editData, setEditData } = useContext(TodoContext);
  
  // [REQUIREMENT 2: Accessing Theme Context]
  // Yahan check kar rahe hain ki dark mode on hai ya nahi.
  const { isDarkMode } = useContext(ThemeContext);

  // [REQUIREMENT: useState]
  // Input fields (title, desc, priority) ka state manage karne ke liye.
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('Medium');

  useEffect(() => {
    if (editData) {
      setTitle(editData.title);
      setDesc(editData.desc);
      setPriority(editData.priority);
    } else {
      setTitle(''); setDesc(''); setPriority('Medium');
    }
  }, [editData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !desc) return toast.error("Please fill all fields!");
    if (editData) updateTodo(editData.id, { title, desc, priority });
    else addTodo({ title, desc, priority });
    setTitle(''); setDesc(''); setPriority('Medium');
  };

  const formCardStyle = {
    background: isDarkMode ? 'rgba(20, 20, 30, 0.6)' : 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px)', 
    borderRadius: '24px',          
    border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.6)',
    boxShadow: isDarkMode ? '0 8px 32px 0 rgba(0, 0, 0, 0.5)' : '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    marginBottom: '24px',
    overflow: 'visible'
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
      color: isDarkMode ? '#fff' : '#333',
      transition: '0.3s',
      '& fieldset': { borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
      '&:hover fieldset': { borderColor: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' },
      '&.Mui-focused fieldset': { borderColor: isDarkMode ? '#90caf9' : '#2196F3' },
    },
    '& .MuiInputLabel-root': { color: isDarkMode ? '#aaa' : '#666' }
  };

  return (
    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
      <Card sx={formCardStyle} elevation={0}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, mb: 3, color: isDarkMode ? '#fff' : '#333', 
            display: 'flex', alignItems: 'center', gap: 1.5, letterSpacing: '0.5px'
          }}>
            {editData ? <EditIcon sx={{ color: '#ff9f43' }}/> : <AddCircleIcon sx={{ color: '#5f27cd' }}/>} 
            {editData ? "Edit Your Task" : "Add New Task"}
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={5}>
                <TextField fullWidth label="What needs to be done?" variant="outlined" size="medium"
                  value={title} onChange={(e) => setTitle(e.target.value)} sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth label="Description" variant="outlined" size="medium"
                  value={desc} onChange={(e) => setDesc(e.target.value)} sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth size="medium" sx={inputSx}>
                  <InputLabel sx={{ color: isDarkMode ? '#aaa' : '#666' }}>Priority</InputLabel>
                  <Select value={priority} label="Priority" onChange={(e) => setPriority(e.target.value)}
                    sx={{ color: isDarkMode ? '#fff' : '#333', borderRadius: '12px' }}
                  >
                    <MenuItem value="High" sx={{ color: '#ff4757' }}>🔥 High</MenuItem>
                    <MenuItem value="Medium" sx={{ color: '#ffa502' }}>⚡ Medium</MenuItem>
                    <MenuItem value="Low" sx={{ color: '#2ed573' }}>☕ Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2} sx={{ display: 'flex' }}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ width: '100%' }}>
                  <Button fullWidth type="submit" variant="contained" sx={{ 
                      height: '100%', borderRadius: '12px', fontWeight: 'bold', textTransform: 'none', fontSize: '1rem',
                      background: editData 
                        ? 'linear-gradient(135deg, #ff9f43 0%, #ff6b6b 100%)' 
                        : 'linear-gradient(135deg, #5f27cd 0%, #48dbfb 100%)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}>
                    {editData ? "Update" : "Create"}
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

// --- 4. Table Component ---
const TodoTable = () => {
  const { todos, deleteTodo, setEditData, toggleTodo } = useContext(TodoContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // =================================================================
  // [REQUIREMENT 4: useMemo]
  // Filtering logic ko optimize kiya hai.
  // Jab tak 'todos', 'searchTerm' ya 'filterStatus' change nahi hote, 
  // yeh calculation dobara nahi chalegi. Heavy filtering mein yeh fast hota hai.
  // =================================================================
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesStatus = true;
      if (filterStatus === "Completed") matchesStatus = todo.completed === true;
      if (filterStatus === "Incomplete") matchesStatus = todo.completed === false;
      return matchesSearch && matchesStatus;
    });
  }, [todos, searchTerm, filterStatus]);

  const getPriorityChip = (p) => {
    const colors = {
      High: { bg: 'rgba(255, 71, 87, 0.1)', text: '#ff4757' },
      Medium: { bg: 'rgba(255, 165, 2, 0.1)', text: '#ffa502' },
      Low: { bg: 'rgba(46, 213, 115, 0.1)', text: '#2ed573' }
    };
    return <Chip label={p} size="small" sx={{ 
      bgcolor: colors[p].bg, color: colors[p].text, fontWeight: 'bold', borderRadius: '8px', border: `1px solid ${colors[p].text}` 
    }} />;
  };

  const tableCardStyle = {
    background: isDarkMode ? 'rgba(20, 20, 30, 0.6)' : 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.6)',
    color: isDarkMode ? '#fff' : '#333',
  };

  const searchInputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#fff',
      color: isDarkMode ? '#fff' : '#333',
      '& fieldset': { borderColor: 'transparent' },
      '&:hover fieldset': { borderColor: 'transparent' },
      '&.Mui-focused fieldset': { borderColor: '#5f27cd' },
    }
  };

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
      <Card sx={tableCardStyle} elevation={0}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon sx={{ color: isDarkMode ? '#a29bfe' : '#5f27cd' }}/> Task List
              </Typography>
              <Typography variant="body2" sx={{ color: isDarkMode ? '#aaa' : '#666', ml: 4 }}>
                {filteredTodos.length} tasks remaining
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField placeholder="Search tasks..." variant="outlined" size="small"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={searchInputSx}
              />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} displayEmpty
                  sx={{ borderRadius: '12px', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#fff', color: isDarkMode ? '#fff' : '#333', '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                >
                  <MenuItem value="All"><FilterListIcon sx={{ fontSize: 16, mr: 1 }}/> All</MenuItem>
                  <MenuItem value="Completed">✅ Done</MenuItem>
                  <MenuItem value="Incomplete">⏳ Pending</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {filteredTodos.length === 0 ? (
             <Box sx={{ textAlign: 'center', py: 8, color: isDarkMode ? '#555' : '#ccc' }}>
                <Typography variant="h5" fontWeight="bold">No Tasks Found</Typography>
                <Typography>Looks like you're free!</Typography>
             </Box>
          ) : (
            <TableContainer component={Box}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    {['Status', 'Task Details', 'Priority', 'Actions'].map((head) => (
                      <TableCell key={head} sx={{ color: isDarkMode ? '#7f8c8d' : '#95a5a6', fontWeight: 700, borderBottom: 'none', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {filteredTodos.map((todo) => (
                      <motion.tr key={todo.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'table-row' }}
                      >
                        {/* [REQUIREMENT: Task Toggle Completed] */}
                        <TableCell sx={{ borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                            <IconButton onClick={() => toggleTodo(todo.id)} 
                              sx={{ color: todo.completed ? '#2ed573' : (isDarkMode ? '#555' : '#ccc'), transition: '0.3s' }}>
                                {todo.completed ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                            </IconButton>
                        </TableCell>
                        <TableCell sx={{ borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                          <Typography variant="subtitle1" sx={{ 
                              fontWeight: 600, color: todo.completed ? (isDarkMode ? '#555' : '#bdc3c7') : (isDarkMode ? '#ecf0f1' : '#2d3436'),
                              textDecoration: todo.completed ? 'line-through' : 'none', transition: '0.3s'
                            }}>
                            {todo.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: isDarkMode ? '#7f8c8d' : '#95a5a6' }}>{todo.desc}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                          {getPriorityChip(todo.priority)}
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                          <IconButton onClick={() => setEditData(todo)} disabled={todo.completed} sx={{ color: '#a29bfe', mr: 1, '&:hover': { bgcolor: 'rgba(162, 155, 254, 0.1)' } }}>
                            <EditIcon fontSize="small"/>
                          </IconButton>
                           {/* [REQUIREMENT: Delete Task] */}
                          <IconButton onClick={() => deleteTodo(todo.id)} sx={{ color: '#ff7675', '&:hover': { bgcolor: 'rgba(255, 118, 117, 0.1)' } }}>
                            <DeleteIcon fontSize="small"/>
                          </IconButton>
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

// --- Main App Component ---
function App() {
  // [REQUIREMENT 2: Theme State]
  // Global Theme toggle karne ke liye state.
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // --- NEW MODERN BACKGROUNDS ---
  const lightBg = "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)"; 
  const darkBg = "linear-gradient(to right, #0f2027, #203a43, #2c5364)"; 

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <TodoProvider>
        <Toaster position="top-center" toastOptions={{ style: { borderRadius: '10px', background: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#fff' : '#333' } }}/>
        
        <div style={{ 
             minHeight: '100vh',
             transition: 'background 0.8s ease',
             background: isDarkMode ? darkBg : lightBg,
             fontFamily: "'Poppins', sans-serif"
        }}>
          <Container maxWidth="md" sx={{ pt: 8, pb: 5 }}>
            
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
                <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100 }}>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 900, letterSpacing: '-1px', color: isDarkMode ? '#fff' : '#2d3436',
                    textShadow: isDarkMode ? '0 0 20px rgba(255,255,255,0.2)' : 'none'
                  }}>
                    Task Management App
                  </Typography>
                </motion.div>

                <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                    <IconButton onClick={toggleTheme} sx={{ 
                      bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#fff', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.2)' : '#f1f2f6' }
                    }}>
                        {isDarkMode ? <LightModeIcon sx={{ color: '#f1c40f' }}/> : <DarkModeIcon sx={{ color: '#2d3436' }}/>}
                    </IconButton>
                </Tooltip>
            </Box>
            
            <TodoForm />
            <TodoTable />
          </Container>
        </div>
      </TodoProvider>
    </ThemeContext.Provider>
  );
}

export default App;