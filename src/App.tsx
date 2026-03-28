/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useEffect, useRef, useMemo, Component, ReactNode } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  setDoc, 
  getDocFromServer,
  Timestamp,
  where,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { 
  Mail,
  Lock,
  Edit,
  Save,
  Trash2,
  MoreVertical,
  LogOut, 
  Send, 
  Globe, 
  User as UserIcon, 
  Loader2, 
  AlertCircle,
  MessageSquare,
  Users,
  ArrowLeft,
  Settings,
  Plus,
  Check,
  Moon,
  Sun,
  Info,
  Users2,
  Languages,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Translations ---

const translations: Record<string, any> = {
  en: {
    globalChat: "Global Chat",
    peopleOnGlobalChat: "People on Global Chat",
    myGroups: "My Groups",
    createGroup: "Create Group",
    settings: "Settings",
    online: "Online",
    signOut: "Sign Out",
    messageGlobal: "Message global chat...",
    messageUser: "Message {name}...",
    messageGroup: "Message {name}...",
    noUsers: "No other users registered yet.",
    noGroups: "You haven't joined any groups yet.",
    groupName: "Group Name",
    groupDesc: "Description (Optional)",
    groupIcon: "Group Icon URL (Optional)",
    selectMembers: "Select Members",
    appearance: "Appearance",
    darkMode: "Dark Mode",
    profileSettings: "Profile Settings",
    displayName: "Display Name",
    photoUrl: "Photo URL",
    saveChanges: "Save Changes",
    language: "Language",
    setupProfile: "Setup Your Profile",
    nickname: "Nickname",
    fullName: "Full Name (First Last)",
    choosePhoto: "Choose a Profile Picture URL",
    completeSetup: "Complete Setup",
    lastSeen: "Last seen",
    members: "members",
    newGroup: "New Group",
    enterGroupName: "Enter group name...",
    groupAbout: "What's this group about?",
    groupIconPlaceholder: "https://example.com/icon.png",
    email: "Email Address",
    password: "Password",
    login: "Login",
    register: "Register",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    groupSettings: "Group Settings",
    editGroup: "Edit Group",
    updateGroup: "Update Group",
    onlyAdminCanEdit: "Only the group creator can edit these settings.",
    emailPlaceholder: "your@email.com",
    passwordPlaceholder: "••••••••",
    deleteGroup: "Delete Group",
    confirmDeleteGroup: "Are you sure you want to delete this group? This action cannot be undone.",
    delete: "Delete",
    cancel: "Cancel",
  },
  ru: {
    globalChat: "Глобальный чат",
    peopleOnGlobalChat: "Люди в глобальном чате",
    myGroups: "Мои группы",
    createGroup: "Создать группу",
    settings: "Настройки",
    online: "В сети",
    signOut: "Выйти",
    messageGlobal: "Написать в глобальный чат...",
    messageUser: "Написать {name}...",
    messageGroup: "Написать в {name}...",
    noUsers: "Других пользователей пока нет.",
    noGroups: "Вы еще не вступили ни в одну группу.",
    groupName: "Название группы",
    groupDesc: "Описание (необязательно)",
    groupIcon: "URL иконки группы (необязательно)",
    selectMembers: "Выбрать участников",
    appearance: "Внешний вид",
    darkMode: "Темная тема",
    profileSettings: "Настройки профиля",
    displayName: "Отображаемое имя",
    photoUrl: "URL фотографии",
    saveChanges: "Сохранить изменения",
    language: "Язык",
    setupProfile: "Настройте свой профиль",
    nickname: "Никнейм",
    fullName: "Имя и Фамилия",
    choosePhoto: "Выберите URL фото профиля",
    completeSetup: "Завершить настройку",
    lastSeen: "Был(а) в сети",
    members: "участников",
    newGroup: "Новая группа",
    enterGroupName: "Введите название группы...",
    groupAbout: "О чем эта группа?",
    groupIconPlaceholder: "https://example.com/icon.png",
  },
  es: {
    globalChat: "Chat Global",
    peopleOnGlobalChat: "Gente en el Chat Global",
    myGroups: "Mis Grupos",
    createGroup: "Crear Grupo",
    settings: "Ajustes",
    online: "En línea",
    signOut: "Cerrar sesión",
    messageGlobal: "Mensaje al chat global...",
    messageUser: "Mensaje a {name}...",
    messageGroup: "Mensaje a {name}...",
    noUsers: "Aún no hay otros usuarios registrados.",
    noGroups: "Aún no te has unido a ningún grupo.",
    groupName: "Nombre del Grupo",
    groupDesc: "Descripción (Opcional)",
    groupIcon: "URL del Icono del Grupo (Opcional)",
    selectMembers: "Seleccionar Miembros",
    appearance: "Apariencia",
    darkMode: "Modo Oscuro",
    profileSettings: "Ajustes de Perfil",
    displayName: "Nombre de Pantalla",
    photoUrl: "URL de la Foto",
    saveChanges: "Guardar Cambios",
    language: "Idioma",
    setupProfile: "Configura tu Perfil",
    nickname: "Apodo",
    fullName: "Nombre Completo (Nombre Apellido)",
    choosePhoto: "Elige una URL de Foto de Perfil",
    completeSetup: "Completar Configuración",
    lastSeen: "Última vez visto",
    members: "miembros",
    newGroup: "Nuevo Grupo",
    enterGroupName: "Introduce el nombre del grupo...",
    groupAbout: "¿De qué trata este grupo?",
    groupIconPlaceholder: "https://example.com/icon.png",
  },
  fr: {
    globalChat: "Chat Global",
    peopleOnGlobalChat: "Personnes sur le Chat Global",
    myGroups: "Mes Groupes",
    createGroup: "Créer un Groupe",
    settings: "Paramètres",
    online: "En ligne",
    signOut: "Se déconnecter",
    messageGlobal: "Message au chat global...",
    messageUser: "Message à {name}...",
    messageGroup: "Message à {name}...",
    noUsers: "Aucun autre utilisateur enregistré pour le moment.",
    noGroups: "Vous n'avez encore rejoint aucun groupe.",
    groupName: "Nom du Groupe",
    groupDesc: "Description (Optionnel)",
    groupIcon: "URL de l'Icône du Groupe (Optionnel)",
    selectMembers: "Sélectionner des Membres",
    appearance: "Apparence",
    darkMode: "Mode Sombre",
    profileSettings: "Paramètres du Profil",
    displayName: "Nom d'affichage",
    photoUrl: "URL de la Photo",
    saveChanges: "Enregistrer les modifications",
    language: "Langue",
    setupProfile: "Configurez votre Profil",
    nickname: "Pseudonyme",
    fullName: "Nom Complet (Prénom Nom)",
    choosePhoto: "Choisissez une URL de Photo de Profil",
    completeSetup: "Terminer la Configuration",
    lastSeen: "Vu pour la dernière fois",
    members: "membres",
    newGroup: "Nouveau Groupe",
    enterGroupName: "Entrez le nom du groupe...",
    groupAbout: "De quoi parle ce groupe ?",
    groupIconPlaceholder: "https://example.com/icon.png",
  },
  de: {
    globalChat: "Globaler Chat",
    peopleOnGlobalChat: "Personen im globalen Chat",
    myGroups: "Meine Gruppen",
    createGroup: "Gruppe erstellen",
    settings: "Einstellungen",
    online: "Online",
    signOut: "Abmelden",
    messageGlobal: "Nachricht an globalen Chat...",
    messageUser: "Nachricht an {name}...",
    messageGroup: "Nachricht an {name}...",
    noUsers: "Noch keine anderen Benutzer registriert.",
    noGroups: "Du bist noch keiner Gruppe beigetreten.",
    groupName: "Gruppenname",
    groupDesc: "Beschreibung (Optional)",
    groupIcon: "Gruppen-Icon-URL (Optional)",
    selectMembers: "Mitglieder auswählen",
    appearance: "Aussehen",
    darkMode: "Dunkelmodus",
    profileSettings: "Profileinstellungen",
    displayName: "Anzeigename",
    photoUrl: "Foto-URL",
    saveChanges: "Änderungen speichern",
    language: "Sprache",
    setupProfile: "Profil einrichten",
    nickname: "Spitzname",
    fullName: "Vollständiger Name (Vorname Nachname)",
    choosePhoto: "Wähle eine Profilbild-URL",
    completeSetup: "Einrichtung abschließen",
    lastSeen: "Zuletzt gesehen",
    members: "Mitglieder",
    newGroup: "Neue Gruppe",
    enterGroupName: "Gruppennamen eingeben...",
    groupAbout: "Worum geht es in dieser Gruppe?",
    groupIconPlaceholder: "https://example.com/icon.png",
  }
};

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' }
];

// --- Types ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

interface Message {
  id: string;
  senderUid: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  createdAt: Timestamp | null;
}

interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  lastSeen?: Timestamp;
  nickname?: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  photoURL?: string;
  createdBy: string;
  members: string[];
  lastMessage?: string;
  updatedAt: Timestamp;
  createdAt: Timestamp;
}

// --- Utilities ---

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Components ---

class ErrorBoundary extends Component<any, any> {
  state = { hasError: false, errorInfo: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    const { hasError, errorInfo } = this.state;
    if (hasError) {
      let displayError = "Something went wrong.";
      try {
        const parsed = JSON.parse(errorInfo || "");
        if (parsed.error) displayError = parsed.error;
      } catch (e) {
        if (errorInfo) displayError = errorInfo;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Error</h2>
            <p className="text-gray-600 mb-6">{displayError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
    <p className="text-gray-600 font-medium">Connecting to Global Chat...</p>
  </div>
);

const LoginScreen = ({ t }: { t: (key: string) => string }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Global Chat</h1>
            <p className="text-gray-500 text-sm">Connect worldwide in real-time</p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
              </div>
            </div>
            
            {error && <p className="text-xs text-red-500 font-medium px-1">{error}</p>}

            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              {isRegistering ? t('register') : t('login')}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold">Or</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-blue-200 transition-all"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>

          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full mt-6 text-sm text-blue-600 font-semibold hover:underline"
          >
            {isRegistering ? t('alreadyHaveAccount') : t('dontHaveAccount')}
          </button>
        </div>
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Secure Global Connection</p>
        </div>
      </motion.div>
    </div>
  );
};

const ProfileSetup = ({ user, onComplete, t }: { user: FirebaseUser, onComplete: () => void, t: (key: string) => string }) => {
  const [nameType, setNameType] = useState<'nickname' | 'fullname'>('nickname');
  const [nickname, setNickname] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(user.email || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const displayName = nameType === 'nickname' ? nickname : `${firstName} ${lastName}`;
    
    try {
      await setDoc(doc(db, 'users_public', user.uid), {
        uid: user.uid,
        displayName: displayName.trim(),
        photoURL: photoURL.trim(),
        nickname: nickname.trim(),
        lastSeen: serverTimestamp(),
        setupComplete: true
      }, { merge: true });
      
      await setDoc(doc(db, 'users_private', user.uid), {
        email: email.trim(),
        setupComplete: true
      }, { merge: true });
      
      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users_setup/${user.uid}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('setupProfile')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              type="button"
              onClick={() => setNameType('nickname')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${nameType === 'nickname' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              {t('nickname')}
            </button>
            <button 
              type="button"
              onClick={() => setNameType('fullname')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${nameType === 'fullname' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              {t('fullName')}
            </button>
          </div>

          {nameType === 'nickname' ? (
            <input 
              type="text" 
              placeholder={t('nickname')}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
              required
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="text" 
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                required
              />
              <input 
                type="text" 
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">{t('email')}</label>
            <input 
              type="email" 
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">{t('choosePhoto')}</label>
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {photoURL ? <img src={photoURL} alt="Preview" className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-gray-400" />}
              </div>
              <input 
                type="text" 
                placeholder="https://..."
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : t('completeSetup')}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const ChatApp = ({ user }: { user: FirebaseUser }) => {
  const [view, setView] = useState<'global' | 'users' | 'private' | 'groups' | 'create-group' | 'group-chat' | 'settings'>('global');
  const [messages, setMessages] = useState<Message[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupIcon, setGroupIcon] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');
  const [editGroupIcon, setEditGroupIcon] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [editName, setEditName] = useState(user.displayName || '');
  const [editPhoto, setEditPhoto] = useState(user.photoURL || '');
  const [editNickname, setEditNickname] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = (key: string, params?: Record<string, string>) => {
    let text = translations[language]?.[key] || translations['en']?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  const privateChatId = useMemo(() => {
    if (!selectedUser) return null;
    return [user.uid, selectedUser.uid].sort().join('_');
  }, [user.uid, selectedUser]);

  useEffect(() => {
    // Test connection to Firestore
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    // Update user profile in Firestore
    const updateUserProfile = async () => {
      try {
        const publicRef = doc(db, 'users_public', user.uid);
        const privateRef = doc(db, 'users_private', user.uid);
        
        await setDoc(publicRef, {
          uid: user.uid,
          lastSeen: serverTimestamp()
        }, { merge: true });
        
        // Fetch public data to initialize edit fields
        const publicSnap = await getDocFromServer(publicRef);
        if (publicSnap.exists()) {
          const data = publicSnap.data();
          if (data.displayName) setEditName(data.displayName);
          if (data.photoURL) setEditPhoto(data.photoURL);
          if (data.nickname) setEditNickname(data.nickname);
        }
        
        // Fetch private data to get language
        const privateSnap = await getDocFromServer(privateRef);
        if (privateSnap.exists()) {
          const data = privateSnap.data();
          if (data.language) setLanguage(data.language);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users_public/${user.uid}`);
      }
    };
    updateUserProfile();

    // Listen for all users
    const usersUnsubscribe = onSnapshot(collection(db, 'users_public'), (snapshot) => {
      const usersList: UserProfile[] = snapshot.docs
        .map(doc => doc.data() as UserProfile)
        .filter(u => u.uid !== user.uid);
      setAllUsers(usersList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users_public');
    });

    return () => usersUnsubscribe();
  }, [user]);

  useEffect(() => {
    // Listen for groups the user is a member of
    const groupsQuery = query(collection(db, 'groups'), where('members', 'array-contains', user.uid), orderBy('updatedAt', 'desc'));
    const groupsUnsubscribe = onSnapshot(groupsQuery, (snapshot) => {
      const groupsList: Group[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Group));
      setGroups(groupsList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'groups');
    });

    return () => groupsUnsubscribe();
  }, [user.uid]);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    if (view === 'global') {
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(50));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs: Message[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Message)).reverse();
        setMessages(msgs);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'messages');
      });
    } else if (view === 'private' && privateChatId) {
      const q = query(collection(db, 'private_chats', privateChatId, 'messages'), orderBy('createdAt', 'desc'), limit(50));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs: Message[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Message)).reverse();
        setMessages(msgs);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `private_chats/${privateChatId}/messages`);
      });
    } else if (view === 'group-chat' && selectedGroup) {
      const q = query(collection(db, 'groups', selectedGroup.id, 'messages'), orderBy('createdAt', 'desc'), limit(50));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs: Message[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Message)).reverse();
        setMessages(msgs);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `groups/${selectedGroup.id}/messages`);
      });
    }

    return () => unsubscribe();
  }, [view, privateChatId, selectedGroup]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || selectedGroup.createdBy !== user.uid) return;

    try {
      await updateDoc(doc(db, 'groups', selectedGroup.id), {
        name: editGroupName.trim(),
        description: editGroupDesc.trim(),
        photoURL: editGroupIcon.trim(),
        updatedAt: serverTimestamp()
      });
      setView('group-chat');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `groups/${selectedGroup.id}`);
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup || selectedGroup.createdBy !== user.uid) return;

    try {
      // Delete the group document
      await deleteDoc(doc(db, 'groups', selectedGroup.id));
      
      // Note: In a production app, you might also want to delete the messages subcollection,
      // but Firestore doesn't support recursive deletes from the client easily.
      // The security rules allow deletion by creator.
      
      setShowDeleteModal(false);
      setSelectedGroup(null);
      setView('groups');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `groups/${selectedGroup.id}`);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    try {
      if (view === 'global') {
        await addDoc(collection(db, 'messages'), {
          senderUid: user.uid,
          senderName: user.displayName || 'Anonymous',
          senderPhoto: user.photoURL || '',
          text: inputText.trim(),
          createdAt: serverTimestamp()
        });
      } else if (view === 'private' && privateChatId && selectedUser) {
        const chatRef = doc(db, 'private_chats', privateChatId);
        await setDoc(chatRef, {
          participants: [user.uid, selectedUser.uid],
          lastMessage: inputText.trim(),
          updatedAt: serverTimestamp()
        }, { merge: true });

        await addDoc(collection(db, 'private_chats', privateChatId, 'messages'), {
          senderUid: user.uid,
          senderName: user.displayName || 'Anonymous',
          senderPhoto: user.photoURL || '',
          text: inputText.trim(),
          createdAt: serverTimestamp()
        });
      } else if (view === 'group-chat' && selectedGroup) {
        const groupRef = doc(db, 'groups', selectedGroup.id);
        await updateDoc(groupRef, {
          lastMessage: inputText.trim(),
          updatedAt: serverTimestamp()
        });

        await addDoc(collection(db, 'groups', selectedGroup.id, 'messages'), {
          senderUid: user.uid,
          senderName: user.displayName || 'Anonymous',
          senderPhoto: user.photoURL || '',
          text: inputText.trim(),
          createdAt: serverTimestamp()
        });
      }
      setInputText('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, view === 'global' ? 'messages' : view === 'private' ? `private_chats/${privateChatId}/messages` : `groups/${selectedGroup?.id}/messages`);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.length === 0) return;

    try {
      const groupData = {
        name: groupName.trim(),
        description: groupDesc.trim(),
        photoURL: groupIcon.trim(),
        createdBy: user.uid,
        members: [user.uid, ...selectedMembers],
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'groups'), groupData);
      setGroupName('');
      setGroupDesc('');
      setGroupIcon('');
      setSelectedMembers([]);
      setSelectedGroup({ id: docRef.id, ...groupData } as any);
      setView('group-chat');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'groups');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'users_public', user.uid), {
        displayName: editName.trim(),
        photoURL: editPhoto.trim(),
        nickname: editNickname.trim()
      }, { merge: true });
      
      await setDoc(doc(db, 'users_private', user.uid), {
        language: language
      }, { merge: true });
      
      alert("Profile updated successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users_public/${user.uid}`);
    }
  };

  const startPrivateChat = (targetUser: UserProfile) => {
    setSelectedUser(targetUser);
    setView('private');
  };

  const toggleMember = (uid: string) => {
    setSelectedMembers(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-colors`}>
        <div className="flex items-center gap-3">
          {view !== 'global' && (
            <button onClick={() => setView('global')} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            {view === 'global' ? <Globe className="w-6 h-6 text-white" /> : 
             view === 'groups' ? <Users2 className="w-6 h-6 text-white" /> :
             view === 'settings' ? <Settings className="w-6 h-6 text-white" /> :
             <MessageSquare className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h1 className={`font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {view === 'global' ? t('globalChat') : 
               view === 'users' ? t('peopleOnGlobalChat') : 
               view === 'groups' ? t('myGroups') :
               view === 'create-group' ? t('createGroup') :
               view === 'group-settings' ? t('groupSettings') :
               view === 'group-chat' ? selectedGroup?.name :
               view === 'settings' ? t('settings') :
               t('messageUser', { name: selectedUser?.displayName || '' })}
            </h1>
            <p className="text-xs text-green-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {t('online')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setView('groups')}
            className={`p-2 rounded-xl transition-all ${view === 'groups' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
            title="Groups"
          >
            <Users2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setView('users')}
            className={`p-2 rounded-xl transition-all ${view === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
            title="All Users"
          >
            <Users className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setView('settings')}
            className={`p-2 rounded-xl transition-all ${view === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          {view === 'group-chat' && selectedGroup?.createdBy === user.uid && (
            <button 
              onClick={() => {
                setEditGroupName(selectedGroup.name);
                setEditGroupDesc(selectedGroup.description || '');
                setEditGroupIcon(selectedGroup.photoURL || '');
                setView('group-settings');
              }}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              title="Group Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={() => signOut(auth)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" ref={scrollRef}>
        {view === 'users' ? (
          <div className="p-4 max-w-2xl mx-auto space-y-3">
            <h2 className={`text-lg font-bold mb-4 px-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('peopleOnGlobalChat')}</h2>
            {allUsers.length === 0 ? (
              <div className={`text-center py-12 rounded-2xl border border-dashed ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <p className="text-gray-400">{t('noUsers')}</p>
              </div>
            ) : (
              allUsers.map(u => (
                <motion.div 
                  key={u.uid}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => startPrivateChat(u)}
                  className={`${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-100 hover:border-blue-300'} p-4 rounded-2xl shadow-sm border flex items-center justify-between cursor-pointer hover:shadow-md transition-all group`}
                >
                  <div className="flex items-center gap-4">
                    {u.photoURL ? (
                      <img src={u.photoURL} alt={u.displayName} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-blue-400" />
                      </div>
                    )}
                    <div>
                      <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{u.displayName}</p>
                      <p className="text-xs text-gray-400">
                        {t('lastSeen')}: {u.lastSeen?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <MessageSquare className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </motion.div>
              ))
            )}
          </div>
        ) : view === 'groups' ? (
          <div className="p-4 max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between px-2 mb-4">
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('myGroups')}</h2>
              <button 
                onClick={() => setView('create-group')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                {t('newGroup')}
              </button>
            </div>
            {groups.length === 0 ? (
              <div className={`text-center py-12 rounded-2xl border border-dashed ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <p className="text-gray-400">{t('noGroups')}</p>
              </div>
            ) : (
              groups.map(g => (
                <motion.div 
                  key={g.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => { setSelectedGroup(g); setView('group-chat'); }}
                  className={`${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-100 hover:border-blue-300'} p-4 rounded-2xl shadow-sm border flex items-center justify-between cursor-pointer hover:shadow-md transition-all group`}
                >
                  <div className="flex items-center gap-4">
                    {g.photoURL ? (
                      <img src={g.photoURL} alt={g.name} className="w-12 h-12 rounded-2xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                        <Users2 className="w-6 h-6 text-indigo-500" />
                      </div>
                    )}
                    <div>
                      <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{g.name}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">
                        {g.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 mb-1">{g.updatedAt?.toDate().toLocaleDateString()}</p>
                    <p className="text-xs text-blue-500 font-medium">{g.members.length} {t('members')}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : view === 'create-group' ? (
          <div className="p-6 max-w-xl mx-auto">
            <form onSubmit={handleCreateGroup} className={`space-y-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-400">{t('groupName')}</label>
                <input 
                  type="text" 
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder={t('enterGroupName')}
                  className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-400">{t('groupDesc')}</label>
                <textarea 
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  placeholder={t('groupAbout')}
                  className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-400">{t('groupIcon')}</label>
                <div className="flex gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {groupIcon ? <img src={groupIcon} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-gray-400" />}
                  </div>
                  <input 
                    type="text" 
                    value={groupIcon}
                    onChange={(e) => setGroupIcon(e.target.value)}
                    placeholder={t('groupIconPlaceholder')}
                    className={`flex-1 px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-400">{t('selectMembers')} ({selectedMembers.length})</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                  {allUsers.map(u => (
                    <div 
                      key={u.uid}
                      onClick={() => toggleMember(u.uid)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        selectedMembers.includes(u.uid) 
                          ? 'bg-blue-50 border-blue-400' 
                          : isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        selectedMembers.includes(u.uid) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                      }`}>
                        {selectedMembers.includes(u.uid) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <p className="text-sm font-medium truncate">{u.displayName}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button 
                type="submit"
                disabled={!groupName.trim() || selectedMembers.length === 0}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
              >
                {t('createGroup')}
              </button>
            </form>
          </div>
        ) : view === 'group-settings' ? (
          <div className="p-6 max-w-xl mx-auto space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setView('group-chat')}
                className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('groupSettings')}</h2>
            </div>

            <form onSubmit={handleUpdateGroup} className="space-y-6">
              <div className="space-y-2">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('groupName')}</label>
                <input 
                  type="text" 
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('groupDesc')}</label>
                <textarea 
                  value={editGroupDesc}
                  onChange={(e) => setEditGroupDesc(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[100px] ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                />
              </div>
              <div className="space-y-2">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('groupIcon')}</label>
                <div className="flex gap-4 items-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {editGroupIcon ? <img src={editGroupIcon} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-gray-400" />}
                  </div>
                  <input 
                    type="text" 
                    value={editGroupIcon}
                    onChange={(e) => setEditGroupIcon(e.target.value)}
                    placeholder="https://..."
                    className={`flex-1 px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                {t('saveChanges')}
              </button>

              <div className="pt-6 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  {t('deleteGroup')}
                </button>
              </div>
            </form>
          </div>
        ) : view === 'settings' ? (
          <div className="p-6 max-w-xl mx-auto space-y-8">
            <section className="space-y-4">
              <h3 className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('appearance')}</h3>
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 rounded-2xl border flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-orange-400" />}
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>{t('darkMode')}</span>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('language')}</h3>
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 rounded-2xl border`}>
                <div className="flex items-center gap-3 mb-4">
                  <Languages className="w-5 h-5 text-blue-500" />
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>{t('language')}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                        language === lang.code 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('profileSettings')}</h3>
              <form onSubmit={handleUpdateProfile} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl border space-y-4`}>
                <div className="space-y-2">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('displayName')}</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('nickname')}</label>
                  <input 
                    type="text" 
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('photoUrl')}</label>
                  <input 
                    type="text" 
                    value={editPhoto}
                    onChange={(e) => setEditPhoto(e.target.value)}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  {t('saveChanges')}
                </button>
              </form>
            </section>

            <section className="space-y-4">
              <h3 className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('signOut')}</h3>
              <button 
                onClick={() => signOut(auth)}
                className="w-full p-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                {t('signOut')}
              </button>
            </section>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isMe = msg.senderUid === user.uid;
                return (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[85%] sm:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isMe && (
                        <div className="flex-shrink-0">
                          {msg.senderPhoto ? (
                            <img src={msg.senderPhoto} alt={msg.senderName} className="w-8 h-8 rounded-full shadow-sm" />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      )}
                      <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                        {!isMe && <p className={`text-[10px] font-bold ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{msg.senderName}</p>}
                        <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : isDarkMode 
                              ? 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                              : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                        }`}>
                          <p className="text-sm sm:text-base leading-relaxed break-words">{msg.text}</p>
                        </div>
                        <p className={`text-[10px] text-gray-400 ${isMe ? 'text-right mr-1' : 'text-left ml-1'}`}>
                          {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Input Area */}
      {['global', 'private', 'group-chat'].includes(view) && (
        <footer className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t p-4 sticky bottom-0 transition-colors`}>
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={view === 'global' ? t('messageGlobal') : view === 'group-chat' ? t('messageGroup', { name: selectedGroup?.name || '' }) : t('messageUser', { name: selectedUser?.displayName || '' })}
              className={`flex-1 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
              maxLength={500}
            />
            <button 
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md active:scale-95"
            >
              {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            </button>
          </form>
        </footer>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative max-w-sm w-full rounded-3xl shadow-2xl p-8 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
            >
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">{t('deleteGroup')}?</h3>
              <p className={`text-center mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('confirmDeleteGroup')}
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDeleteGroup}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                >
                  {t('delete')}
                </button>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className={`w-full py-4 rounded-2xl font-bold transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if setup is complete
        try {
          const publicRef = doc(db, 'users_public', user.uid);
          const publicSnap = await getDocFromServer(publicRef);
          if (!publicSnap.exists() || !publicSnap.data().setupComplete) {
            setSetupRequired(true);
          } else {
            setSetupRequired(false);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users_public/${user.uid}`);
          // If we can't check, assume we need setup if displayName is missing
          if (!user.displayName) setSetupRequired(true);
        }
      }
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <LoadingScreen />;
  
  // Simple translation function for initial screens
  const t = (key: string) => translations['en'][key] || key;

  if (!user) return <LoginScreen t={t} />;

  if (setupRequired) {
    return <ProfileSetup user={user} onComplete={() => setSetupRequired(false)} t={t} />;
  }

  return (
    <ErrorBoundary>
      <ChatApp user={user} />
    </ErrorBoundary>
  );
}
