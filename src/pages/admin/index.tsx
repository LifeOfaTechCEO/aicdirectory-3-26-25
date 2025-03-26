import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import styles from '@/styles/Admin.module.css';
import EmojiPicker from '../../components/EmojiPicker';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TreeView from '../../components/TreeView';
import ImageUpload from '../../components/ImageUpload';
import { Item, Category, Section } from '../../types';
import SectionEditor from '../../components/SectionEditor';

interface CustomField {
  id: string;
  name: string;
  value: string;
}

export default function Admin() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [apiStatus, setApiStatus] = useState<'ok' | 'degraded' | 'offline'>('ok');
  const [debugInfo, setDebugInfo] = useState<any>({});
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check authentication from localStorage using multiple possible keys
  useEffect(() => {
    const sessionId = Math.random().toString(36).substring(2, 10);
    console.log(`[Admin-${sessionId}] Admin Page Component - v2.0.0`, {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      url: window.location.href
    });

    try {
      // Log localStorage state
      const allStorageKeys = Object.keys(localStorage);
      console.log(`[Admin-${sessionId}] localStorage state:`, {
        keys: allStorageKeys,
        keyCount: allStorageKeys.length
      });
      
      // Check for admin status using multiple possible keys for compatibility
      const isAdminFlag = localStorage.getItem('isAdmin');
      const isAdminLoggedInFlag = localStorage.getItem('isAdminLoggedIn');
      const isAdminBypassFlag = localStorage.getItem('isAdminLoggedInBypass');
      
      // Debug info
      const authDebug = {
        sessionId,
        timestamp: new Date().toISOString(),
        isAdminFlag,
        isAdminLoggedInFlag,
        isAdminBypassFlag,
        authenticated: isAdminFlag === 'true' || isAdminLoggedInFlag === 'true' || isAdminBypassFlag === 'true'
      };
      
      setDebugInfo(prev => ({ ...prev, auth: authDebug }));
      console.log(`[Admin-${sessionId}] Authentication check:`, authDebug);
      
      // Check if any of the admin flags are true
      if (isAdminFlag === 'true' || isAdminLoggedInFlag === 'true' || isAdminBypassFlag === 'true') {
        console.log(`[Admin-${sessionId}] Admin authenticated, proceeding to load data`);
        setIsAuthenticated(true);
        fetchSections(sessionId);
      } else {
        console.log(`[Admin-${sessionId}] Authentication failed, redirecting to login`);
        
        // Add small delay before redirect to ensure log visibility
        setTimeout(() => {
          router.push('/admin/login');
        }, 50);
      }
    } catch (err) {
      console.error(`[Admin-${sessionId}] Error verifying authentication:`, err);
      setDebugInfo(prev => ({ 
        ...prev, 
        authError: { 
          message: err instanceof Error ? err.message : 'Unknown error',
          time: new Date().toISOString()
        } 
      }));
      
      // If localStorage access fails, still try to proceed as authenticated
      // This helps with browsers that block localStorage in some contexts
      setIsAuthenticated(true);
      setError('Warning: Browser storage access failed. Some features may not work correctly.');
      fetchSections(sessionId);
    }
  }, [router]);

  // Fetch sections data
  const fetchSections = async (sessionId = 'retry') => {
    const requestId = sessionId || Math.random().toString(36).substring(2, 10);
    console.log(`[Admin-${requestId}] Fetching sections data...`);
    
    try {
      setLoading(true);
      setError(null);
      
      // Apply a fetch timeout to avoid hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      // Add debug info in request headers
      const response = await fetch('/api/sections', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Admin-Session': requestId
        },
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // Log response info
      console.log(`[Admin-${requestId}] API response received:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: {
          contentType: response.headers.get('Content-Type'),
          requestId: response.headers.get('X-API-Request-ID')
        }
      });
      
      // Handle HTTP error responses with fallback data extraction
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Admin-${requestId}] API error response:`, errorText);
        
        // Try to extract useful data from error response
        try {
          const errorJson = JSON.parse(errorText);
          
          // Update debug info
          setDebugInfo(prev => ({ 
            ...prev, 
            apiError: {
              status: response.status,
              message: errorJson.message || errorJson.error || 'Unknown API error',
              time: new Date().toISOString(),
              isOffline: !!errorJson.isOffline
            }
          }));
          
          // If the error response contains sections, use them
          if (errorJson.sections && Array.isArray(errorJson.sections)) {
            console.log(`[Admin-${requestId}] Found fallback sections in error response`);
            setSections(errorJson.sections);
            setError(`API Error: ${errorJson.message || errorJson.error || 'Unknown API error'} (showing fallback data)`);
            setApiStatus(errorJson.isOffline ? 'offline' : 'degraded');
            setOfflineMode(!!errorJson.isOffline);
            setLoading(false);
            return;
          }
        } catch (jsonError) {
          // Just continue with regular error handling if JSON parsing fails
          console.log(`[Admin-${requestId}] Error response is not valid JSON`);
        }
        
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Parse response data
      let data;
      try {
        data = await response.json();
        console.log(`[Admin-${requestId}] API data received:`, {
          success: data.success,
          timestamp: data.timestamp,
          requestId: data.requestId,
          isOffline: data.isOffline,
          sectionsCount: data.sections?.length
        });
        
        // Update debug info
        setDebugInfo(prev => ({ 
          ...prev, 
          apiResponse: {
            success: data.success,
            timestamp: data.timestamp,
            isOffline: data.isOffline,
            sectionsCount: data.sections?.length,
            time: new Date().toISOString()
          }
        }));
      } catch (jsonError) {
        console.error(`[Admin-${requestId}] JSON parse error:`, jsonError);
        throw new Error('Failed to parse API response');
      }
      
      // Handle offline mode
      if (data.isOffline) {
        console.warn(`[Admin-${requestId}] API is in offline mode. Limited admin functionality available.`);
        setOfflineMode(true);
        setApiStatus('offline');
        setError('Database connection unavailable. Limited admin functionality available.');
      }
      
      // Get sections data with format flexibility
      let sectionsArray: Section[] = [];
      if (data.sections && Array.isArray(data.sections)) {
        sectionsArray = data.sections;
      } else if (data.data && Array.isArray(data.data)) {
        sectionsArray = data.data;
      } else if (Array.isArray(data)) {
        sectionsArray = data;
      } else {
        console.error(`[Admin-${requestId}] Unknown data format:`, {
          dataType: typeof data,
          isArray: Array.isArray(data),
          keys: data ? Object.keys(data) : []
        });
        throw new Error('Received data in an unknown format');
      }
      
      // Handle empty data
      if (sectionsArray.length === 0) {
        console.warn(`[Admin-${requestId}] Received empty sections array`);
        
        // Show notice but don't trigger error state for empty data
        setError('No sections data available');
      } else {
        // Clear error if we have data and we're not in offline mode
        if (!data.isOffline) {
          setError(null);
        }
      }
      
      // Update state with the received data
      setSections(sectionsArray);
      console.log(`[Admin-${requestId}] Successfully loaded ${sectionsArray.length} sections`);
      
      // Set API status to OK if not offline
      if (!data.isOffline) {
        setApiStatus('ok');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[Admin-${requestId}] Error fetching sections:`, {
        error: errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        type: err instanceof Error ? err.name : typeof err
      });
      
      // Update debug info
      setDebugInfo(prev => ({ 
        ...prev, 
        fetchError: {
          message: errorMessage,
          type: err instanceof Error ? err.name : typeof err,
          time: new Date().toISOString()
        }
      }));
      
      setError(`Failed to load sections: ${errorMessage}`);
      setApiStatus('degraded');
      
      // When fetch fails, try navigator.onLine to detect offline status
      if (!navigator.onLine) {
        setOfflineMode(true);
        setApiStatus('offline');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle saving sections
  const handleSave = async (updatedSections: Section[]) => {
    const requestId = Math.random().toString(36).substring(2, 10);
    console.log(`[Admin-${requestId}] Saving updated sections...`);
    
    try {
      setLoading(true);
      
      // Don't allow saves in offline mode
      if (offlineMode) {
        console.warn(`[Admin-${requestId}] Cannot save in offline mode`);
        setError('Cannot save changes while in offline mode - database connection is unavailable');
        return;
      }
      
      // Apply a save timeout to avoid hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch('/api/sections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Admin-Session': requestId
        },
        body: JSON.stringify(updatedSections),
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // Log response info
      console.log(`[Admin-${requestId}] Save response received:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      // Handle error response
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Admin-${requestId}] API error during save:`, errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      // Parse response
      const result = await response.json();
      console.log(`[Admin-${requestId}] Sections saved successfully:`, {
        success: result.success,
        sectionsCount: result.sections?.length,
        message: result.message
      });
      
      // Update local state with saved data for consistency
      if (result.sections && Array.isArray(result.sections)) {
        setSections(result.sections);
      }
      
      // Show success message
      alert('Changes saved successfully!');
      setError(null);
      setApiStatus('ok');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[Admin-${requestId}] Error saving sections:`, {
        error: errorMessage,
        stack: err instanceof Error ? err.stack : undefined
      });
      
      setError(`Failed to save changes: ${errorMessage}`);
      setApiStatus('degraded');
      
      // Show user-friendly error message
      alert(`Failed to save changes: ${errorMessage}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout with verification
  const handleLogout = () => {
    const requestId = Math.random().toString(36).substring(2, 10);
    console.log(`[Admin-${requestId}] Logging out...`);
    
    try {
      // Clear all possible admin flags
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('isAdminLoggedInBypass');
      
      // Verify logout
      const adminCheck1 = localStorage.getItem('isAdmin');
      const adminCheck2 = localStorage.getItem('isAdminLoggedIn');
      const adminCheck3 = localStorage.getItem('isAdminLoggedInBypass');
      
      console.log(`[Admin-${requestId}] Logout verification:`, {
        isAdmin: adminCheck1,
        isAdminLoggedIn: adminCheck2,
        isAdminLoggedInBypass: adminCheck3,
        success: !adminCheck1 && !adminCheck2 && !adminCheck3
      });
      
      // Redirect to login page
      router.push('/admin/login');
    } catch (err) {
      console.error(`[Admin-${requestId}] Error during logout:`, err);
      
      // Even if localStorage fails, still redirect to login
      alert('Logout may not have fully completed, but you will be redirected to the login page.');
      router.push('/admin/login');
    }
  };

  // If not yet checked authentication, show a pleasant loading state
  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Admin Panel - AI & Crypto Directory</title>
        </Head>
        <div className={styles.authLoading}>
          <h2>Verifying Admin Access</h2>
          <p>Please wait while we verify your credentials...</p>
          <div className={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Admin Panel - AI & Crypto Directory</title>
      </Head>

      <header className={styles.header}>
        <h1>AI & Crypto Directory Admin</h1>
        
        {/* Status indicator */}
        {offlineMode && (
          <div className={styles.offlineBadge}>OFFLINE MODE</div>
        )}
        {apiStatus === 'degraded' && !offlineMode && (
          <div className={styles.warningBadge}>LIMITED CONNECTIVITY</div>
        )}
        
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </header>

      <main className={styles.main}>
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            {apiStatus !== 'ok' && (
              <button 
                className={styles.retryButton}
                onClick={() => fetchSections()}
              >
                Retry Connection
              </button>
            )}
          </div>
        )}
        
        {loading ? (
          <div className={styles.loading}>
            <p>Loading sections data...</p>
            <div className={styles.loadingSpinner}></div>
          </div>
        ) : (
          <div className={styles.editorContainer}>
            <SectionEditor 
              sections={sections} 
              onSave={handleSave}
              readOnly={offlineMode}
            />
            
            {/* Status message for readOnly mode */}
            {offlineMode && sections.length > 0 && (
              <div className={styles.offlineMessage}>
                <p>You're viewing data in read-only mode. Editing and saving are disabled while offline.</p>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Hidden debug info */}
      <div id="admin-debug" style={{ display: 'none' }} data-debug={JSON.stringify(debugInfo)}></div>
    </div>
  );
}