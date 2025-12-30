import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; 
import { auth, googleProvider } from './firebase'; // Make sure firebase.js is configured
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

// --- IMPORT IMAGES (Using URLs for demo to work immediately) ---
// Remove these and use your local imports if you prefer: import sirsubhanImg from './pic/sirsubhan.png';
const sirsubhanImg = "https://ui-avatars.com/api/?name=Subhan+Arif&background=10B981&color=fff";
const mambushraImg = "https://ui-avatars.com/api/?name=Bushra&background=6366F1&color=fff";
const hashirImg = "https://ui-avatars.com/api/?name=Hashir&background=random";
const fareedImg = "https://ui-avatars.com/api/?name=Fareed&background=random";
const noorImg = "https://ui-avatars.com/api/?name=Noor&background=random";
const madihaImg = "https://ui-avatars.com/api/?name=Madiha&background=random";
const uswaImg = "https://ui-avatars.com/api/?name=Uswa&background=random";
const rabiaImg = "https://ui-avatars.com/api/?name=Rabia&background=random";

// --- HERO IMAGE (Skin) ---
const heroSkinImg = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

// --- ICONS (SVG Components) ---
const Icons = {
  Sun: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  Moon: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Upload: () => <svg width="48" height="48" stroke="currentColor" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>,
  Loader: () => <div className="loader-spin"></div>,
  Close: () => <svg width="20" height="20" stroke="currentColor" fill="none" viewBox="0 0 24 24" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>,
  Google: () => <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
  Warning: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
};

// --- HELPER: PARSE AI TEXT ---
const parseRecommendations = (text) => {
  const sections = [];
  const disclaimerMatch = text.match(/(Disclaimer:.*?)$/im); 
  const disclaimer = disclaimerMatch ? disclaimerMatch[0] : null;
  const regex = /(\d+\.\s+\*\*(.*?)\*\*:)\s*([\s\S]*?)(?=\d+\.\s+\*\*|$)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const title = match[2];
    const content = match[3].trim();
    const bullets = content.split('-').map(item => item.trim()).filter(item => item.length > 0);
    sections.push({ title, bullets });
  }
  return { disclaimer, sections };
};

// --- COMPONENT: TYPEWRITER EFFECT ---
function TypewriterText({ text, delay = 10 }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index === text.length) clearInterval(interval);
    }, delay);
    return () => clearInterval(interval);
  }, [text, delay]);

  return <span>{displayedText}</span>;
}

// --- COMPONENTS ---

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-notification toast-${type}`}>
      <span>{message}</span>
      <button onClick={onClose}><Icons.Close /></button>
    </div>
  );
}

// --- AUTH MODAL COMPONENT ---
function AuthModal({ isOpen, onClose, onLoginSuccess, showToast }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
        showToast("Account created successfully!", "success");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showToast("Login successful!", "success");
      }
      onClose();
    } catch (error) {
      console.error(error);
      showToast(error.message.replace("Firebase: ", ""), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      showToast("Logged in with Google", "success");
      onClose();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content auth-card">
        <button className="modal-close" onClick={onClose}><Icons.Close /></button>
        <div className="text-center" style={{marginBottom: '24px'}}>
          <Link to="/" className="logo" style={{fontSize: '1.8rem'}}>DERMA<span>LYZE</span></Link>
          <p style={{color: 'var(--text-muted)', marginTop: '10px'}}>
            {mode === 'login' ? 'Welcome back! Please login to continue.' : 'Join us to start your skin health journey.'}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="flex gap-4">
              <input type="text" className="form-input" placeholder="First Name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <input type="text" className="form-input" placeholder="Last Name" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          )}
          <input type="email" className="form-input" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="form-input" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Sign Up')}
          </button>
        </form>
        <div className="divider">or continue with</div>
        <button onClick={handleGoogleSignIn} className="btn btn-outline w-full flex justify-center items-center gap-2" disabled={loading}>
          <Icons.Google /> Google
        </button>
        <div className="text-center" style={{marginTop: '20px', fontSize: '0.9rem'}}>
          {mode === 'login' ? (
            <>Don't have an account? <span className="link-primary" onClick={() => setMode('signup')}>Sign Up</span></>
          ) : (
            <>Already registered? <span className="link-primary" onClick={() => setMode('login')}>Login</span></>
          )}
        </div>
      </div>
    </div>
  );
}

// --- NAVBAR ---
function Navbar({ handleStartAnalysis }) {
  return (
    <header className="navbar-wrapper">
      <div className="navbar-pill">
        <Link to="/" className="logo">DERMA<span>LYZE</span></Link>
        <nav className="nav-links">
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#team" className="nav-link">Team</a>
        </nav>
        <div className="nav-actions">
          <button onClick={handleStartAnalysis} className="btn-analyze">Analyze</button>
        </div>
      </div>
    </header>
  );
}

// --- UPDATED HERO WITH SCANNER ---
function Hero({ handleStartAnalysis }) {
  return (
    <section className="hero container flex">
      <div className="hero-content">
        <div className="badge" style={{marginBottom: '16px'}}>AI Powered Dermatology</div>
        <h1>Precision Skin Analysis Powered by Deep Learning.</h1>
        <p>Identify bacterial, fungal, and viral skin infections instantly using our ResNet50 model. Early detection is key to effective treatment.</p>
        <p className="team-tag">By BSAI-3rd</p>
        <div className="flex gap-4" style={{marginTop: '30px'}}>
          <button onClick={handleStartAnalysis} className="btn btn-primary">Start Free Analysis</button>
          <a href="#how-it-works" className="btn btn-outline">How It Works</a>
        </div>
      </div>
      
      {/* --- SCANNER EFFECT HERO CARD --- */}
      <div className="hero-visual">
        <div className="hero-card scanner-wrapper">
          <div className="scan-overlay"></div>
          <div className="scan-line"></div>
          <div className="scan-glow-top"></div>
          
          <img src={heroSkinImg} alt="Skin Analysis" className="scan-target-img" />
          
          <div className="status-box">
            <div className="flex justify-between items-center">
              <span style={{fontWeight: 700}}>Status: Healthy</span>
              <span style={{color: 'var(--success)', fontWeight: 700}}>99% Match</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{width: '99%'}}></div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="how-it-works" className="section-padding container">
      <div className="text-center" style={{marginBottom: '60px'}}>
        <h2>How It Works</h2>
      </div>
      <div className="grid grid-3">
        {[
          {title: "Upload Image", icon: "📸", desc: "Take a clear photo of affected area."},
          {title: "AI Processing", icon: "🧠", desc: "ResNet50 analyzes features against 8 classes."},
          {title: "Get Result", icon: "📋", desc: "Receive diagnosis and AI generated remedies."} 
        ].map((item, idx) => (
          <div key={idx} className="card text-center glass-card">
            <div className="icon-box" style={{margin: '0 auto 20px'}}>{item.icon}</div>
            <h3>{item.title}</h3>
            <p style={{color: 'var(--text-muted)'}}>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectDetails() {
  return (
    <section id="project-details" className="section-padding" style={{background: 'var(--bg-body)'}}>
      <div className="container">
        <div className="text-center" style={{marginBottom: '60px'}}>
          <h2>Project & Technology Stack</h2>
          <p style={{color: 'var(--text-muted)'}}>Built with Python, PyTorch, and Modern React</p>
        </div>
        <div className="grid grid-2">
          <div className="card glass-card">
            <h3>Architecture Overview</h3>
            <p style={{color: 'var(--text-muted)', margin: '20px 0'}}>Dermalyze utilizes Transfer Learning with a pre-trained <b>ResNet50</b> model and OpenAI API for intelligent recommendations.</p>
            <div className="flex gap-2" style={{flexWrap: 'wrap'}}>
              <span className="badge">Python 3</span>
              <span className="badge">PyTorch</span>
              <span className="badge">FastAPI</span>
              <span className="badge">OpenAI</span>
            </div>
          </div>
          <div className="card glass-card">
            <h3>Dataset & Results</h3>
            <ul style={{color: 'var(--text-muted)', listStyle: 'disc', marginLeft: '20px', lineHeight: 2}}>
              <li><b>Total Images:</b> 1,159</li>
              <li><b>Accuracy:</b> ~75%</li>
              <li><b>AI Advisor:</b> Enabled</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- TEAM COMPONENT ---
function Team() {
  const instructors = [
    { name: "Sir Subhan Arif", role: "Project Instructor", img: sirsubhanImg },
    { name: "Mam Bushra", role: "Lab Instructor", img: mambushraImg }
  ];
  const members = [
    { name: "Muhammad Hashir Tayyab", rollNo: "Sr. 405", img: hashirImg },
    { name: "Muhammad Fareed ud din", rollNo: "Sr. 407", img: fareedImg },
    { name: "Noor Fatima", rollNo: "Sr. 406", img: noorImg },
    { name: "Madiha Noor", rollNo: "Sr. 430", img: madihaImg },
    { name: "Uswa Imran", rollNo: "Sr. 437", img: uswaImg },
    { name: "Rabia Shabir", rollNo: "Sr. 424", img: rabiaImg }
  ];

  const handleImageError = (e, name) => {
    e.target.onerror = null;
    const nameUrl = name.split(' ').join('+');
    e.target.src = `https://ui-avatars.com/api/?name=${nameUrl}&background=random&color=fff&size=200`;
  };

  const TeamCard = ({ person, isInstructor = false }) => (
    <div className={`team-card glass-card ${isInstructor ? 'instructor-card' : ''}`}>
      <div className="team-img-wrapper">
        <img src={person.img} alt={person.name} className="team-img" onError={(e) => handleImageError(e, person.name)} />
        {isInstructor && <div className="crown-badge">👑</div>}
      </div>
      <div className="team-info">
        <h3>{person.name}</h3>
        {isInstructor ? (
          <span className="team-role">{person.role}</span>
        ) : (
          <span className="team-roll">{person.rollNo}</span>
        )}
      </div>
    </div>
  );

  return (
    <section id="team" className="section-padding" style={{background: 'var(--bg-body)'}}>
      <div className="container">
        <div className="text-center" style={{marginBottom: '60px'}}>
          <h2>Our Team</h2>
          <p style={{color: 'var(--text-muted)'}}>Meet minds behind Dermalyze</p>
        </div>
        <div className="instructor-grid">
          {instructors.map((inst, idx) => <TeamCard key={idx} person={inst} isInstructor={true} />)}
        </div>
        <div className="members-grid">
          {members.map((mem, idx) => <TeamCard key={idx} person={mem} isInstructor={false} />)}
        </div>
      </div>
    </section>
  );
}

// --- UPDATED ANALYSIS PAGE ---
function AnalysisPage({ user, scansLeft, setScansLeft, showToast, onOpenAuth }) {
  const [step, setStep] = useState('upload');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [parsedRecs, setParsedRecs] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleAnalyze = () => {
    if (!user) {
      if (scansLeft > 0) {
        setScansLeft(scansLeft - 1);
        localStorage.setItem('dermalyze_free_scans', (scansLeft - 1).toString());
        proceedWithAnalysis();
      } else {
        onOpenAuth();
        return;
      }
    } else {
      proceedWithAnalysis();
    }
  };

  const proceedWithAnalysis = async () => {
    if (!preview) {
      showToast("Please upload an image first.", "error");
      return;
    }

    setStep('processing');
    setParsedRecs(null); 
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      if(symptoms.trim() !== "") {
        formData.append('symptoms', symptoms);
      }

      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const cleanName = data.prediction.includes('-') 
          ? data.prediction.split('-').pop().trim() 
          : data.prediction;

        setResult({
          name: cleanName,
          rawPrediction: data.prediction,
          confidence: parseFloat(data.confidence.replace('%', '')),
          recommendations: data.recommendations,
          image: preview
        });

        const parsed = parseRecommendations(data.recommendations);
        setParsedRecs(parsed);

        setStep('result');
        showToast("Analysis Complete!", "success");
      } else {
        throw new Error(data.error || "Analysis failed");
      }

    } catch (error) {
      console.error(error);
      showToast(error.message || "Connection Error. Is backend running?", "error");
      setStep('upload');
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 50) return '#F59E0B';
    return 'var(--danger)';
  };

  return (
    <section className="container" style={{paddingTop: '120px', paddingBottom: '80px'}}>
      <div className="text-center" style={{marginBottom: '40px'}}>
        <h2>AI Skin Analysis</h2>
        <p style={{color: 'var(--text-muted)'}}>
          {!user ? `Free scans remaining: ${scansLeft}` : 'Unlimited Access'}
        </p>
      </div>

      <div className="analyzer-container glass-card">
        {step === 'upload' && (
          <>
            <div className="upload-area" onClick={() => document.getElementById('fileInput').click()}>
              {preview ? (
                <img src={preview} alt="Preview" className="preview-img" />
              ) : (
                <>
                  <div style={{marginBottom: '16px'}}><Icons.Upload /></div>
                  <h3>Click to Upload Image</h3>
                  <p style={{color: 'var(--text-muted)'}}>JPG, PNG, WEBP supported</p>
                </>
              )}
              <input type="file" id="fileInput" hidden onChange={handleFileChange} />
            </div>
            
            <div style={{padding: '0 40px 40px'}}>
              <textarea 
                className="form-input" 
                rows="3" 
                placeholder="Describe symptoms (itching, pain, redness...)" 
                style={{resize: 'none', marginBottom: '20px'}}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
              <button onClick={handleAnalyze} className="btn btn-primary" style={{width: '100%'}}>
                {user ? 'Start Analysis' : (scansLeft > 0 ? `Use Free Scan (${scansLeft})` : 'Login to Analyze')}
              </button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="processing-wrapper">
            {/* --- SCANNER EFFECT ON USER IMAGE --- */}
            <div className="scanner-wrapper processing-scanner">
              <div className="scan-overlay"></div>
              <div className="scan-line"></div>
              <div className="scan-glow-top"></div>
              <img src={preview} alt="Scanning" className="scan-target-img processing-img" />
            </div>
            
            <div className="text-center" style={{marginTop: '30px'}}>
              <h3>Analyzing with AI...</h3>
              <p style={{color: 'var(--text-muted)'}}>Consulting medical database & neural networks...</p>
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <div className="result-area active">
            <div className="flex gap-4" style={{marginBottom: '30px', alignItems: 'center'}}>
              <img src={result.image} alt="Result" style={{width: '120px', height: '120px', objectFit: 'cover', borderRadius: '16px'}} />
              <div>
                <div className="badge" style={{marginBottom: '10px', background: result.confidence > 80 ? 'var(--success)' : 'var(--warning)', color: 'white'}}>
                  {result.confidence > 80 ? 'High Confidence' : 'Moderate Confidence'}
                </div>
                <h2 style={{fontSize: '1.8rem'}}>{result.name}</h2>
                <p style={{color: 'var(--text-muted)'}}>{result.confidence}% Probability Match</p>
              </div>
            </div>

            <div className="progress-bar" style={{marginBottom: '40px', height: '10px'}}>
              <div className="progress-fill" style={{width: `${result.confidence}%`, background: result.confidence > 80 ? 'var(--success)' : 'var(--warning)'}}></div>
            </div>

            <div style={{maxWidth: '800px', margin: '0 auto'}}>
              
              {parsedRecs && parsedRecs.disclaimer && (
                <div className="disclaimer-box">
                  <small>⚠️ {parsedRecs.disclaimer.replace('Disclaimer:', '')}</small>
                </div>
              )}

              {parsedRecs ? (
                <div className="rec-cards-grid">
                  {parsedRecs.sections.map((section, idx) => {
                    const isRedFlag = section.title.toLowerCase().includes('red flag');
                    let cardClass = "rec-card";
                    if (isRedFlag) cardClass += " rec-card-red";
                    else if (section.title.includes('Home')) cardClass += " rec-card-green";
                    else if (section.title.includes('Over')) cardClass += " rec-card-purple";
                    else cardClass += " rec-card-blue";

                    return (
                      <div key={idx} className={`glass-card ${cardClass}`}>
                        <h4 style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px'}}>
                          {isRedFlag && <Icons.Warning />}
                          {section.title}
                        </h4>
                        <ul>
                          {section.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} style={{marginBottom:'10px', lineHeight:1.6}}>
                              <TypewriterText text={bullet} delay={5} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rec-cards-grid">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass-card rec-card skeleton-card">
                      <div className="skeleton-title"></div>
                      <div className="skeleton-text"></div>
                      <div className="skeleton-text"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4" style={{marginTop: '40px'}}>
              <button onClick={() => {setStep('upload'); setPreview(null); setSymptoms(""); setResult(null); setParsedRecs(null);}} className="btn btn-outline" style={{flex: 1}}>New Scan</button>
              <button className="btn btn-primary" style={{flex: 1}} onClick={() => showToast('Report saved!', 'success')}>Save Report</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Footer({ user }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/'; 
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <footer>
      <div className="container">
        <div className="grid grid-2" style={{marginBottom: '40px'}}>
          <div>
            <Link to="/" className="logo">DERMA<span>LYZE</span></Link>
            <p style={{color: 'var(--text-muted)', marginTop: '20px', maxWidth: '300px'}}>
              Advanced AI-powered skin disease classification system.
            </p>
          </div>
          <div>
            <h4>Links</h4>
            <ul style={{color: 'var(--text-muted)', lineHeight: 2, marginTop: '10px'}}>
              <li><a href="#how-it-works">How it Works</a></li>
              <li><a href="#project-details">Documentation</a></li>
              <li><a href="#team">Team</a></li>
              {user && (
                <li>
                  <button onClick={handleLogout} style={{background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0, font: 'inherit'}}>Sign Out</button>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="text-center" style={{borderTop: '1px solid var(--border)', paddingTop: '20px', color: 'var(--text-muted)', fontSize: '0.9rem'}}>
          &copy; 2023 Dermalyze. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// --- MAIN APP COMPONENT ---

function App() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [scansLeft, setScansLeft] = useState(2);
  const [toast, setToast] = useState(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.setAttribute('data-theme', savedTheme);

    const savedScans = localStorage.getItem('dermalyze_free_scans');
    if (savedScans) setScansLeft(parseInt(savedScans));

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthModalOpen(false);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleStartAnalysis = () => {
    if (!user && scansLeft <= 0) {
      setAuthModalOpen(true);
    } else {
      window.location.href = '/analyze';
    }
  };

  return (
    <Router>
      <div className="app-container">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <Navbar handleStartAnalysis={handleStartAnalysis} />
        <Routes>
          <Route path="/" element={
            <>
              <Hero handleStartAnalysis={handleStartAnalysis} />
              <Features />
              <ProjectDetails />
              <Team />
            </>
          } />
          <Route path="/analyze" element={
            <AnalysisPage 
              user={user} 
              scansLeft={scansLeft} 
              setScansLeft={setScansLeft} 
              showToast={(m, t) => setToast({message:m, type:t})} 
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          } />
        </Routes>

        <button className="sticky-theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
        </button>

        <Footer user={user} />

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={() => setUser(auth.currentUser)}
          showToast={(m, t) => setToast({message:m, type:t})}
        />
      </div>
    </Router>
  );
}

export default App;