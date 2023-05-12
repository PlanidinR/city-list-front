import React, {useState} from 'react';
import axios from 'axios';
import {Grid, TextField, Button, Table, TableHead, TableBody, TableRow, TableCell} from '@mui/material';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import City from './City';
import Page from "./Page";

const App: React.FC = () => {
    const theme = createTheme();

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [cities, setCities] = useState<City[]>([]);
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

            const response = await axios.post('http://localhost:8080/api/login', auth);

            if (response.status === 200) {
                setIsLoggedIn(true);
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
        setIsLoggedIn(false);
        setCurrentPage(0);
        setCities([]);
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
            <div>
                <h1>Cities</h1>
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
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cities.map((city) => (
                                    <TableRow key={city.id}>
                                        <TableCell>{city.name}</TableCell>
                                        <TableCell>
                                            <img src={city.url} alt={city.name}/>
                                        </TableCell>
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
