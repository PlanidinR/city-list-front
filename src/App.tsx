import React, {useState} from 'react';
import axios from 'axios';
import City from './City';
import Page from "./Page";

const App: React.FC = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [cities, setCities] = useState<City[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const handleLogin = async (login: string, password: string) => {
        try {
            const auth = {
                login: login,
                password: password,
            };

            const response = await axios.post('http://localhost:8080/api/login', auth);

            if (response.status === 200) {
                setIsLoggedIn(true);
                await getCities(login, password, currentPage); // Pass login and password to getCities
            } else {
                setLoginError('Login failed');
            }
        } catch (error) {
            console.error('Error logging in:', error);
        }
    };

    const getCities = async (login: string, password: string, page: number) => {
        try {
            const response = await axios.get<Page>('http://localhost:8080/api/cities', {
                auth: {
                    username: login,
                    password: password,
                },
                params: {
                    page: page,
                    limit: 5,
                },
            });
            const {content, totalPages, totalElements} = response.data;

            setCities(content);
            setTotalPages(totalPages);
            setTotalElements(totalElements);

        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
            getCities(login, password, currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
            getCities(login, password, currentPage + 1);
        }
    };

//     return (
//         <div>
//             <h1>Cities</h1>
//             {isLoggedIn ? (
//                 <table>
//                     <thead>
//                     <tr>
//                         <th>Name</th>
//                         <th>Photo</th>
//                     </tr>
//                     </thead>
//                     <tbody>
//                     {cities.map((city) => (
//                         <tr key={city.id}>
//                             <td>{city.name}</td>
//                             <td>
//                                 <img src={city.url} alt={city.name} />
//                             </td>
//                         </tr>
//                     ))}
//                     </tbody>
//                 </table>
//             ) : (
//                 <LoginForm handleLogin={handleLogin} loginError={loginError} />
//             )}
//         </div>
//     );
// };

    return (
        <div>
            <h1>Cities</h1>
            {isLoggedIn ? (
                <div>
                    <table>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Photo</th>
                        </tr>
                        </thead>
                        <tbody>
                        {cities.map((city) => (
                            <tr key={city.id}>
                                <td>{city.name}</td>
                                <td>
                                    <img src={city.url} alt={city.name}/>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <div>
                        <button onClick={goToPreviousPage} disabled={currentPage === 0}>
                            Previous Page
                        </button>
                        <button onClick={goToNextPage} disabled={currentPage === totalPages - 1}>
                            Next Page
                        </button>
                    </div>
                </div>
            ) : (
                <LoginForm handleLogin={handleLogin} loginError={loginError}/>
            )}
        </div>
    );
};

type LoginFormProps = {
    handleLogin: (login: string, password: string) => void;
    loginError: string;
};

const LoginForm: React.FC<LoginFormProps> = ({handleLogin, loginError}) => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin(login, password);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <h1>Login</h1>
                <label htmlFor="Login">Login:</label>
                <input type="text" id="login" value={login} onChange={(e) => setLogin(e.target.value)}/>
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div>
                <button type="submit">Login</button>
            </div>
            {loginError && <div>{loginError}</div>}
        </form>
    );
};

export default App;
