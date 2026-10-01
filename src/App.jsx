import React, { useEffect, useMemo, useRef, useState } from "react";
import { Music2, Search, Plus, Trash2, Play, Pause, Headphones, Disc3, Mic2, Upload, LogIn, LogOut, X, ListMusic, ShieldCheck, FolderMusic } from "lucide-react";
import { auth, db, storage, firebaseConfigured } from "./firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

const CATEGORIES = ["Religieux", "Fitness", "Musique courante", "Autres"];
const demoSongs = [
  { id:"demo1", title:"Exemple de son religieux", artist:"Artiste à renseigner", category:"Religieux", url:"", demo:true },
  { id:"demo2", title:"Exemple de son d'entraînement", artist:"Artiste à renseigner", category:"Fitness", url:"", demo:true },
  { id:"demo3", title:"Exemple de musique courante", artist:"Artiste à renseigner", category:"Musique courante", url:"", demo:true }
];

export default function App() {
  const [songs, setSongs] = useState(demoSongs);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tout");
  const [active, setActive] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [form, setForm] = useState({ title:"", artist:"", category:"Religieux", file:null });
  const audioRef = useRef(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    if (!firebaseConfigured) return;
    return onSnapshot(query(collection(db, "songs"), orderBy("createdAt", "desc")), snap => {
      setSongs(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    }, err => setNotice("Impossible de charger la bibliothèque : " + err.message));
  }, []);

  const filtered = useMemo(() => songs.filter(s =>
    (category === "Tout" || s.category === category) &&
    (s.title + " " + s.artist + " " + s.category).toLowerCase().includes(search.toLowerCase())
  ), [songs, category, search]);
  const artists = useMemo(() => [...new Set(songs.map(s => s.artist).filter(Boolean))], [songs]);
  const isAdmin = !!user;

  async function login(e) {
    e.preventDefault(); setBusy(true);
    try { await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword); setShowLogin(false); setNotice("Connexion administrateur réussie."); }
    catch (err) { setNotice("Connexion impossible. Vérifie les identifiants et la configuration Firebase."); }
    finally { setBusy(false); }
  }
  async function addSong(e) {
    e.preventDefault();
    if (!form.file || !form.title.trim() || !form.artist.trim()) { setNotice("Ajoute un titre, un artiste et un fichier audio."); return; }
    if (!firebaseConfigured) { setNotice("Configure d'abord Firebase pour enregistrer des sons."); return; }
    setBusy(true);
    try {
      const safeName = form.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileRef = ref(storage, `audio/${Date.now()}-${safeName}`);
      await uploadBytes(fileRef, form.file, { contentType: form.file.type || "audio/mpeg" });
      const url = await getDownloadURL(fileRef);
      await addDoc(collection(db, "songs"), { title:form.title.trim(), artist:form.artist.trim(), category:form.category, url, storagePath:fileRef.fullPath, fileName:form.file.name, createdAt:serverTimestamp() });
      setForm({ title:"", artist:"", category:"Religieux", file:null }); setShowAdd(false); setNotice("Son ajouté à la bibliothèque.");
    } catch (err) { setNotice("Ajout échoué : vérifie les règles Firestore et Storage."); }
    finally { setBusy(false); }
  }
  async function removeSong(song) {
    if (!window.confirm(`Supprimer « ${song.title} » ?`)) return;
    if (song.demo) { setSongs(prev => prev.filter(s => s.id !== song.id)); return; }
    try {
      await deleteDoc(doc(db, "songs", song.id));
      if (song.storagePath) await deleteObject(ref(storage, song.storagePath)).catch(() => {});
      if (active?.id === song.id) setActive(null);
      setNotice("Son supprimé.");
    } catch { setNotice("Suppression refusée. Vérifie les droits administrateur Firebase."); }
  }
  function play(song) {
    if (!song.url) { setNotice("Ceci est un exemple. L'administrateur doit ajouter un vrai fichier audio."); return; }
    setActive(song);
    setTimeout(() => audioRef.current?.play().catch(() => {}), 80);
  }
  const categories = ["Tout", ...CATEGORIES, ...songs.map(s=>s.category).filter(c=>!CATEGORIES.includes(c)).filter((c,i,a)=>a.indexOf(c)===i)];
  const countBy = c => songs.filter(s => s.category === c).length;

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" aria-label="SamaSons accueil"><span className="brand-icon"><Music2 size={22}/></span><span>Sama<span className="accent">Sons</span><small>MA BIBLIOTHÈQUE MUSICALE</small></span></a>
      <div className="top-actions">
        {isAdmin ? <><span className="admin-pill"><ShieldCheck size={14}/> Admin</span><button className="icon-btn" title="Déconnexion" onClick={()=>signOut(auth)}><LogOut size={18}/></button></> : <button className="login-btn" onClick={()=>setShowLogin(true)}><LogIn size={16}/> Admin</button>}
      </div>
    </header>
    <main className="main">
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><span className="live-dot"/> TA COLLECTION, AU MÊME ENDROIT</div>
          <h1>Le son qui<br/><span>te ressemble.</span></h1>
          <p>Retrouve tes sons religieux, tes musiques d'entraînement et tes artistes préférés dans une seule bibliothèque.</p>
          <div className="hero-stats"><div><strong>{songs.length}</strong><span>Morceaux</span></div><div><strong>{artists.length}</strong><span>Artistes</span></div><div><strong>{categories.length-1}</strong><span>Catégories</span></div></div>
        </div>
        <div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="vinyl"><div className="vinyl-label"><Music2 size={30}/></div></div><div className="floating-note note-a">♫</div><div className="floating-note note-b">♪</div></div>
      </section>
      {!firebaseConfigured && <div className="setup-warning"><strong>Mode aperçu</strong><span>Les exemples ci-dessous montrent l'interface. Configure Firebase pour rendre les ajouts et le catalogue réellement partagés.</span></div>}
      {notice && <div className="notice" role="status">{notice}<button onClick={()=>setNotice("")}><X size={15}/></button></div>}
      <section className="section-head"><div><span className="eyebrow">EXPLORE TA COLLECTION</span><h2>Ma bibliothèque</h2></div>{isAdmin && <button className="primary-btn" onClick={()=>setShowAdd(true)}><Plus size={17}/> Ajouter un son</button>}</section>
      <div className="search-wrap"><Search size={19}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un son, un artiste..."/>{search && <button onClick={()=>setSearch("")}><X size={16}/></button>}</div>
      <div className="category-row">{categories.map(c=><button key={c} className={`category-chip ${category===c?"selected":""}`} onClick={()=>setCategory(c)}>{c==="Tout"?<ListMusic size={15}/>:<FolderMusic size={15}/>} {c}{c!=="Tout"&&<span>{countBy(c)}</span>}</button>)}</div>
      <section className="library-layout">
        <div className="songs-column"><div className="list-heading"><span>{category==="Tout"?"Tous les morceaux":category}</span><span>{filtered.length} titre{filtered.length!==1?"s":""}</span></div>
          {filtered.length===0 ? <div className="empty"><Disc3 size={34}/><strong>Aucun son trouvé</strong><span>Essaie un autre mot ou une autre catégorie.</span></div> :
            <div className="song-list">{filtered.map((song,i)=><article className={`song-row ${active?.id===song.id?"playing":""}`} key={song.id}>
              <button className="cover" onClick={()=>play(song)} aria-label={`Écouter ${song.title}`}>{song.url?<span className="cover-bars"><i/><i/><i/><i/></span>:<Music2 size={22}/>}</button>
              <button className="song-info" onClick={()=>play(song)}><strong>{song.title}</strong><span>{song.artist}</span></button>
              <span className="song-category">{song.category}</span>
              <button className="play-btn" onClick={()=>active?.id===song.id?audioRef.current?.pause():play(song)} aria-label="Lire"><Play size={17} fill="currentColor"/></button>
              {isAdmin && !song.demo && <button className="delete-btn" onClick={()=>removeSong(song)} aria-label="Supprimer"><Trash2 size={16}/></button>}
            </article>)}</div>}
        </div>
        <aside className="side-card"><div className="side-card-icon"><Headphones size={23}/></div><span className="eyebrow">TES ARTISTES</span><h3>Chaque voix<br/>a sa place.</h3><p>Retrouve les morceaux regroupés par chanteur, sans mélanger les styles.</p>
          <div className="artist-list">{artists.slice(0,5).map((artist,i)=><div className="artist-item" key={artist}><span className={`artist-avatar avatar-${i%4}`}><Mic2 size={16}/></span><span>{artist}</span><small>{songs.filter(s=>s.artist===artist).length}</small></div>)}
          {artists.length===0&&<div className="artist-empty">Les artistes apparaîtront ici quand tu ajouteras tes sons.</div>}</div>
        </aside>
      </section>
      <footer><span className="footer-brand"><Music2 size={16}/> SamaSons</span><span>Une bibliothèque. Tous tes sons.</span><button onClick={()=>navigator.clipboard?.writeText(window.location.href).then(()=>setNotice("Lien copié !")).catch(()=>setNotice("Copie le lien depuis la barre d'adresse."))}>Partager le lien ↗</button></footer>
    </main>
    {active?.url && <div className="player-bar"><button className="player-cover"><Music2/></button><div className="player-meta"><strong>{active.title}</strong><span>{active.artist}</span></div><audio ref={audioRef} controls src={active.url} autoPlay onEnded={()=>setActive(null)}/><button className="icon-btn" onClick={()=>{audioRef.current?.pause();setActive(null)}}><X size={18}/></button></div>}
    {showLogin && <div className="modal-backdrop" onClick={()=>setShowLogin(false)}><form className="modal" onSubmit={login} onClick={e=>e.stopPropagation()}><button type="button" className="modal-close" onClick={()=>setShowLogin(false)}><X/></button><span className="modal-icon"><ShieldCheck/></span><h2>Espace administrateur</h2><p>Connecte-toi pour gérer la bibliothèque.</p><label>Adresse e-mail<input type="email" required value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="ton@email.com"/></label><label>Mot de passe<input type="password" required value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} placeholder="Mot de passe"/></label><button className="primary-btn full" disabled={busy}>{busy?"Connexion…":"Se connecter"}</button></form></div>}
    {showAdd && <div className="modal-backdrop" onClick={()=>setShowAdd(false)}><form className="modal" onSubmit={addSong} onClick={e=>e.stopPropagation()}><button type="button" className="modal-close" onClick={()=>setShowAdd(false)}><X/></button><span className="modal-icon"><Upload/></span><h2>Ajouter un son</h2><p>Le morceau sera visible par tous les visiteurs.</p><label>Titre du son<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Nom du morceau"/></label><label>Nom du chanteur<input required value={form.artist} onChange={e=>setForm({...form,artist:e.target.value})} placeholder="Nom de l'artiste"/></label><label>Catégorie<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label><label className="file-label"><Upload size={17}/><span>{form.file?form.file.name:"Choisir un fichier audio (MP3, WAV…)"}</span><input type="file" accept="audio/*" required onChange={e=>setForm({...form,file:e.target.files?.[0]||null})}/></label><button className="primary-btn full" disabled={busy}>{busy?"Enregistrement…":"Ajouter à la bibliothèque"}</button></form></div>}
  </div>;
}