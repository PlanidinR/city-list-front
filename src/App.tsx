import React, {useState} from 'react';
import axios from 'axios';
import {Grid, TextField, Button, Table, TableHead, TableBody, TableRow, IconButton, TableCell, Box, Typography} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import City from './City';
import Page from "./Page";
import UserInfo from "./UserInfo";

const App: React.FC = () => {
    const theme = createTheme();

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');

    const [cities, setCities] = useState<City[]>([]);
    const [editCity, setEditCity] = useState<City>();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginError, setLoginError] = useState('');

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogin = async (login: string, password: string) => {
        try {
            const auth = {
                login: login,
                password: password,
            };

            const response = await axios.post<UserInfo>('http://localhost:8080/api/login', auth);

            if (response.status === 200) {
                setIsLoggedIn(true);
                setRole(response.data.role);
                getCities(login, password, currentPage);
            } else {
                setLoginError('Login failed');
            }
        } catch (error) {
            console.error('Error logging in:', error);
        }
    };

    const handleLogout = () => {
        setLogin('');
        setPassword('');
        setRole('');
        setIsLoggedIn(false);
        setCurrentPage(0);
        setCities([]);
        setSearchQuery('');
    };

    const getCities = async (login: string, password: string, page: number, name?: string) => {
        try {
            const response = await axios.get<Page>('http://localhost:8080/api/cities', {
                auth: {
                    username: login,
                    password: password,
                },
                params: {
                    page: page,
                    limit: 5,
                    name: name || undefined,
                },
            });

            const {content, totalPages} = response.data;

            setLogin(login);
            setPassword(password);
            setCities(content);
            setTotalPages(totalPages);

        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    const handleSearch = () => {
        setCurrentPage(0);
        getCities(login, password, 0, searchQuery);
    };

    const handleEdit = (city: City) => {
        setEditCity(city);
    };

    const handleSave = async (login: string, password: string, page: number, updatedCity: City) => {
        try {
            const response = await axios.patch('http://localhost:8080/api/cities', updatedCity, {
                auth: {
                    username: login,
                    password: password,
                },
            });
            if (response.status === 200) {
                getCities(login, password, page, searchQuery);
            }
        } catch (error) {
            console.error('Error updating city:', error);
        }
    };

    const EditForm = ({city, onSave, login, password, page,}:
                          { city: City; onSave: (login: string, password: string, page: number, updatedCity: City) => void;
                              login: string; password: string; page: number; }) => {
        const [name, setName] = useState(city.name);
        const [url, setURL] = useState(city.url);

        const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setName(e.target.value);
        };

        const handleURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setURL(e.target.value);
        };

        const handleSave = () => {
            const updatedCity = {
                id: city.id,
                name: name,
                url: url,
            };
            onSave(login, password, page, updatedCity);
        };

        return (
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h5">Edit City</Typography>
                <Box marginBottom={2}>
                    <Typography>Name:</Typography>
                    <TextField value={name} onChange={handleNameChange} />
                </Box>
                <Box marginBottom={2}>
                    <Typography>URL:</Typography>
                    <TextField value={url} onChange={handleURLChange} />
                </Box>
                <Button variant="contained" onClick={handleSave}>
                    Save
                </Button>
            </Box>
        );
    };

    const goToPreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
            getCities(login, password, currentPage - 1, searchQuery);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
            getCities(login, password, currentPage + 1, searchQuery);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ marginBottom: '20px' }}>Cities</h1>
                {isLoggedIn ? (
                    <div>
                        <Grid container alignItems="center" justifyContent="center" mb={2}>
                            <Grid item xs={8} sm={6} md={4}>
                                <TextField
                                    label="Search by city name"
                                    fullWidth
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={4} sm={2} md={1}>
                                <Button variant="contained" onClick={handleSearch} fullWidth>
                                    Search
                                </Button>
                            </Grid>
                        </Grid>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Photo</TableCell>
                                    {role === 'ROLE_ALLOW_EDIT' && <TableCell>Action</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cities.map((city) => (
                                    <TableRow key={city.id}>
                                        <TableCell>{city.name}</TableCell>
                                        <TableCell>
                                            <img src={city.url} alt={city.name}/>
                                        </TableCell>
                                        {role === 'ROLE_ALLOW_EDIT' && (
                                            <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                                {editCity && editCity.id === city.id ? (
                                                    <EditForm
                                                        city={editCity}
                                                        onSave={(login, password, currentPage, updatedCity) => handleSave(login, password, currentPage, updatedCity)}
                                                        login={login}
                                                        password={password}
                                                        page={currentPage}
                                                    />
                                                ) : (
                                                    <IconButton sx={{ marginRight: '8px' }} onClick={() => handleEdit(city)}>
                                                    <EditIcon />
                                                </IconButton>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Grid container justifyContent="center" mt={2}>
                            <Grid item>
                                <Button onClick={goToPreviousPage} disabled={currentPage === 0}>
                                    Previous Page
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button onClick={goToNextPage} disabled={currentPage === totalPages - 1}>
                                    Next Page
                                </Button>
                            </Grid>
                        </Grid>
                        <Grid container justifyContent="center" mt={2}>
                            <Grid item>
                                <Button onClick={handleLogout}>
                                    Logout
                                </Button>
                            </Grid>
                        </Grid>
                    </div>
                ) : (
                    <LoginForm handleLogin={handleLogin} loginError={loginError}/>
                )}
            </div>
        </ThemeProvider>
    );
};

type LoginFormProps = {
    handleLogin: (login: string, password: string) => void;
    loginError: string;
};

const LoginForm: React.FC<LoginFormProps> = ({handleLogin, loginError}) => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const theme = createTheme();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin(login, password);
    };

    return (
        <ThemeProvider theme={theme}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2} alignItems="center" justifyContent="center">
                    <Grid item xs={12}>
                        <h1>Login</h1>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            type="text"
                            id="login"
                            label="Login"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            type="password"
                            id="password"
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary">
                            Login
                        </Button>
                    </Grid>
                    {loginError && (
                        <Grid item xs={12}>
                            <div>{loginError}</div>
                        </Grid>
                    )}
                </Grid>
            </form>
        </ThemeProvider>
    );
};

export default App;
