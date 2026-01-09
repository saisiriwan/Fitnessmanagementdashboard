import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent } from './ui/card';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Dumbbell, 
  ArrowRightIcon, 
  TrendingUp, 
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Target,
  Activity
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import logoImage from 'figma:asset/5aea59314b610931c0ec7711e632ddb11fa89be7.png';

export default function SignIn() {
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUsernameError('');

    try {
      if (isLogin) {
        // LOGIN - Accept both username or email
        const users = JSON.parse(localStorage.getItem('trainer_users') || '[]');
        const user = users.find((u: any) => 
          (u.email === email || u.username === email) && u.password === password
        );

        if (!user) {
          toast.error('ชื่อผู้ใช้/อีเมลหรือรหัสผ่านไม่ถูกต้อง');
          setLoading(false);
          return;
        }

        // Store current user
        localStorage.setItem('trainer_current_user', JSON.stringify(user));
        toast.success(`ยินดีต้อนรับกลับ @${user.username}! 💪`);
        
        // Trigger auth context update
        await signIn();
        navigate('/dashboard');
      } else {
        // REGISTER - Save to localStorage
        if (!agreeToTerms) {
          toast.error('กรุณายอมรับข้อกำหนดและเงื่อนไข');
          setLoading(false);
          return;
        }

        // Validate username format
        const usernameRegex = /^[a-zA-Z0-9_.]+$/;
        if (!usernameRegex.test(username)) {
          setUsernameError('ชื่อผู้ใช้ต้องเป็นตัวอักษร ตัวเลข _ และ . เท่านั้น');
          toast.error('รูปแบบชื่อผู้ใช้ไม่ถูกต้อง');
          setLoading(false);
          return;
        }

        // Validate username length
        if (username.length < 3 || username.length > 20) {
          setUsernameError('ชื่อผู้ใช้ต้องมีความยาว 3-20 ตัวอักษร');
          toast.error('ชื่อผู้ใช้ต้องมีความยาว 3-20 ตัวอักษร');
          setLoading(false);
          return;
        }

        const users = JSON.parse(localStorage.getItem('trainer_users') || '[]');
        
        // Check if email exists
        if (users.some((u: any) => u.email === email)) {
          toast.error('อีเมลนี้ถูกใช้งานแล้ว');
          setLoading(false);
          return;
        }

        // Check if username exists
        if (users.some((u: any) => u.username.toLowerCase() === username.toLowerCase())) {
          setUsernameError('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว โปรดลองใช้ชื่ออื่น');
          toast.error(`@${username} ถูกใช้งานแล้ว 😢`);
          setLoading(false);
          return;
        }

        // Create new user
        const newUser = {
          id: Date.now().toString(),
          firstName,
          lastName,
          username: username.toLowerCase(),
          email,
          password,
          name: `${firstName} ${lastName}`,
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem('trainer_users', JSON.stringify(users));

        toast.success(`สร้างบัญชี @${username} สำเร็จ! 🎉`);
        setIsLogin(true);
        setFirstName('');
        setLastName('');
        setUsername('');
        setPassword('');
        setAgreeToTerms(false);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn();
      toast.success('เข้าสู่ระบบด้วย Google สำเร็จ');
      navigate('/dashboard');
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-[#001529] via-[#002140] to-[#001a33] relative">
      {/* Animated Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Floating Orbs */}
      <motion.div
        animate={{ 
          y: [0, -30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-20 w-96 h-96 bg-[#FF6B35] rounded-full opacity-10 blur-3xl"
      />
      <motion.div
        animate={{ 
          y: [0, 30, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-20 right-20 w-96 h-96 bg-[#0077cc] rounded-full opacity-10 blur-3xl"
      />

      {/* LEFT SIDE - Brand Showcase (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1741156229623-da94e6d7977d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwZ3ltJTIwdHJhaW5lciUyMHdvcmtvdXR8ZW58MXx8fHwxNzY1Nzg5NzAxfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Fitness Background"
            className="w-full h-full object-cover"
          />
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#001529]/95 via-[#002140]/90 to-[#003d73]/95" />
          {/* Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-5" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>

        {/* Content - Compact & Centered */}
        <div className="relative z-10 flex flex-col justify-between p-8 text-white w-full">
          {/* Logo & Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35] to-[#ff8555] rounded-xl opacity-75 blur-lg group-hover:blur-xl transition-all" />
                <div className="relative w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-2xl overflow-hidden p-1">
                  <img src={logoImage} alt="Trainer Pro Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Trainer Pro</h2>
                <p className="text-[10px] text-white/70">Personal Training Platform</p>
              </div>
            </div>
          </motion.div>

          {/* Hero Content - Centered */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-5"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FF6B35]/10 backdrop-blur-sm border border-[#FF6B35]/20 rounded-full">
              <Sparkles className="h-3.5 w-3.5 text-[#FF6B35]" />
              <span className="text-xs text-[#FF6B35] font-medium uppercase tracking-wider">
                Premium Platform
              </span>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <h1 className="leading-tight tracking-tight" style={{ fontSize: 'clamp(2rem, 3.5vw, 3.5rem)' }}>
                <span className="font-bold text-white block">Transform Your</span>
                <span className="font-bold bg-gradient-to-r from-white via-white to-[#FF6B35] bg-clip-text text-transparent block">
                  Fitness Journey
                </span>
              </h1>
            </div>
          </motion.div>

          {/* Empty Space */}
          <div></div>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="w-full max-w-md space-y-3 relative z-10">
          {/* Mobile Logo - COMPACT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:hidden flex justify-center"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35] to-[#ff8555] rounded-lg opacity-75 blur-md" />
                <div className="relative w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-xl overflow-hidden p-0.5">
                  <img src={logoImage} alt="Trainer Pro Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-white" style={{ fontSize: '1rem' }}>Trainer Pro</h2>
                <p className="text-white/60" style={{ fontSize: '0.625rem' }}>Training Platform</p>
              </div>
            </div>
          </motion.div>

          {/* User Type Badge - COMPACT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-sm bg-[#FF6B35]/10 border-[#FF6B35] text-[#FF6B35]" style={{ fontSize: '0.75rem' }}>
              <Dumbbell className="h-3 w-3" />
              <span className="font-semibold">สำหรับเทรนเนอร์</span>
            </div>
          </motion.div>

          {/* Header - COMPACT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center space-y-0.5"
          >
            <h2 className="font-bold text-white tracking-tight" style={{ fontSize: isLogin ? '1.5rem' : '1.25rem' }}>
              {isLogin ? 'ยินดีต้อนรับกลับ' : 'เริ่มต้นใช้งาน'}
            </h2>
            <p className="text-white/60" style={{ fontSize: '0.75rem' }}>
              {isLogin ? 'ยังไม่มีบัญชี?' : 'มีบัญชีอยู่แล้ว?'}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#FF6B35] hover:text-[#ff8555] font-semibold transition-colors hover:underline"
              >
                {isLogin ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
              </button>
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20">
              <CardContent className={isLogin ? "p-4" : "p-3"}>
                <form onSubmit={handleSubmit} className={isLogin ? "space-y-3" : "space-y-2"}>
                  {/* First Name & Last Name */}
                  {!isLogin && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-medium text-white/70 pl-1">ชื่อ</label>
                        <div className="relative">
                          <User className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40" />
                          <Input
                            type="text"
                            placeholder="ชื่อ"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="bg-white/5 border-white/10 focus:border-[#FF6B35] focus:ring-[#FF6B35] h-8 rounded-lg pl-8 text-white placeholder:text-white/40 backdrop-blur-sm"
                            style={{ fontSize: '0.8125rem' }}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-medium text-white/70 pl-1">นามสกุล</label>
                        <div className="relative">
                          <User className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40" />
                          <Input
                            type="text"
                            placeholder="นามสกุล"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="bg-white/5 border-white/10 focus:border-[#FF6B35] focus:ring-[#FF6B35] h-8 rounded-lg pl-8 text-white placeholder:text-white/40 backdrop-blur-sm"
                            style={{ fontSize: '0.8125rem' }}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Username */}
                  {!isLogin && (
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-medium text-white/70 pl-1">ชื่อผู้ใช้</label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40 font-medium" style={{ fontSize: '0.8125rem' }}>@</span>
                        <Input
                          type="text"
                          placeholder="username"
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value);
                            setUsernameError('');
                          }}
                          className={`bg-white/5 border-white/10 focus:border-[#FF6B35] focus:ring-[#FF6B35] h-8 rounded-lg pl-6 text-white placeholder:text-white/40 backdrop-blur-sm ${
                            usernameError ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
                          }`}
                          style={{ fontSize: '0.8125rem' }}
                          required
                        />
                      </div>
                      {usernameError && (
                        <p className="text-[9px] text-red-400 flex items-center gap-0.5 px-1">
                          <span>⚠️</span>
                          <span>{usernameError}</span>
                        </p>
                      )}
                      {!usernameError && username && (
                        <p className="text-[9px] text-green-400 flex items-center gap-0.5 px-1">
                          <span>✓</span>
                          <span>@{username.toLowerCase()}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Email */}
                  <div className={isLogin ? "space-y-1" : "space-y-0.5"}>
                    <label className="text-[9px] font-medium text-white/70 pl-1">
                      {isLogin ? 'ชื่อผู้ใช้ หรือ อีเมล' : 'อีเมล'}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40" />
                      <Input
                        type={isLogin ? 'text' : 'email'}
                        placeholder={isLogin ? 'username หรือ email' : 'email@example.com'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`bg-white/5 border-white/10 focus:border-[#FF6B35] focus:ring-[#FF6B35] ${isLogin ? 'h-9' : 'h-8'} rounded-lg pl-8 text-white placeholder:text-white/40 backdrop-blur-sm`}
                        style={{ fontSize: '0.8125rem' }}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className={isLogin ? "space-y-1" : "space-y-0.5"}>
                    <label className="text-[9px] font-medium text-white/70 pl-1">รหัสผ่าน</label>
                    <div className="relative">
                      <Lock className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`bg-white/5 border-white/10 focus:border-[#FF6B35] focus:ring-[#FF6B35] ${isLogin ? 'h-9' : 'h-8'} rounded-lg pl-8 pr-8 text-white placeholder:text-white/40 backdrop-blur-sm`}
                        style={{ fontSize: '0.8125rem' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Terms - COMPACT */}
                  {!isLogin && (
                    <div className="flex items-start space-x-1.5 p-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                      <Checkbox
                        id="terms"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                        className="border-white/30 bg-white/5 data-[state=checked]:bg-[#FF6B35] data-[state=checked]:border-[#FF6B35] mt-0.5 h-3.5 w-3.5"
                      />
                      <label
                        htmlFor="terms"
                        className="text-white/80 leading-tight cursor-pointer"
                        style={{ fontSize: '0.6875rem' }}
                      >
                        ยอมรับ{' '}
                        <span className="text-[#FF6B35] hover:text-[#ff8555] hover:underline">
                          ข้อกำหนด
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className={`w-full bg-gradient-to-r from-[#FF6B35] to-[#ff8555] hover:from-[#ff8555] hover:to-[#FF6B35] text-white font-semibold ${isLogin ? 'h-9' : 'h-8'} rounded-lg shadow-lg shadow-[#FF6B35]/30 hover:shadow-xl hover:shadow-[#FF6B35]/40 transition-all transform hover:scale-[1.02] active:scale-[0.98]`}
                    style={{ fontSize: '0.8125rem' }}
                    disabled={loading || (!isLogin && !agreeToTerms)}
                  >
                    {loading ? (
                      <span className="flex items-center gap-1.5">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        กำลังดำเนินการ...
                      </span>
                    ) : isLogin ? (
                      'เข้าสู่ระบบ'
                    ) : (
                      'สร้างบัญชี'
                    )}
                  </Button>

                  {/* Divider */}
                  <div className={isLogin ? "relative py-1.5" : "relative py-1"}>
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-[9px] uppercase">
                      <span className="bg-white/10 backdrop-blur-sm px-2 py-0.5 text-white/60 font-medium rounded-full">
                        หรือ
                      </span>
                    </div>
                  </div>

                  {/* Google Sign In */}
                  <Button
                    type="button"
                    variant="outline"
                    className={`w-full bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30 text-white ${isLogin ? 'h-9' : 'h-8'} rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm`}
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <svg className="h-3.5 w-3.5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="##EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="font-medium" style={{ fontSize: '0.8125rem' }}>Google</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}