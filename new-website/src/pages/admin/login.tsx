import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../../styles/AdminLogin.module.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      // Set a simple session token
      localStorage.setItem('adminToken', 'authenticated');
      router.push('/admin');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Admin Login - AI & Crypto Directory</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.loginBox}>
          <h1 className={styles.title}>Admin Login</h1>
          
          {error && <p className={styles.error}>{error}</p>}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>

            <button type="submit" className={styles.loginButton}>
              Login
            </button>
          </form>
        </div>
      </main>
    </div>
  );
} 