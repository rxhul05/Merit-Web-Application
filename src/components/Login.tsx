import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Users, BarChart3, Award } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await login(email, password);
    setLoading(false);
  };

  const features = [
    { icon: Users, title: "Student Management", desc: "Comprehensive student records" },
    { icon: BarChart3, title: "Performance Analytics", desc: "Real-time academic insights" },
    { icon: Award, title: "Merit Rankings", desc: "Automated merit list generation" },
    { icon: Shield, title: "Secure Access", desc: "Enterprise-grade security" }
  ];

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_50%)]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-accent-500/3 to-gold-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Logo & Brand */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-accent p-3 rounded-2xl shadow-glow mr-4">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold gradient-text">Merit System</h1>
                  <p className="text-gray-400 text-sm font-medium">Academic Excellence Platform</p>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Transform your academic management with our comprehensive platform designed for modern educational institutions.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className={`card-hover p-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{transitionDelay: `${index * 150}ms`}}
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-accent p-2 rounded-xl shadow-glow flex-shrink-0">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-400">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className={`mt-12 flex space-x-8 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">10K+</div>
                <div className="text-sm text-gray-400">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">500+</div>
                <div className="text-sm text-gray-400">Institutions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">99.9%</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className={`w-full max-w-md transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-accent p-3 rounded-2xl shadow-glow">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold gradient-text">Merit System</h1>
              <p className="text-gray-400 text-sm">Academic Excellence Platform</p>
            </div>

            {/* Login Card */}
            <div className="card p-8 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-100 mb-2">Welcome Back</h2>
                <p className="text-gray-400">Sign in to access your dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 transition-colors ${focusedField === 'email' ? 'text-accent-400' : 'text-gray-500'}`} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="input-dark w-full pl-12 transition-all duration-200 focus:scale-[1.02]"
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 transition-colors ${focusedField === 'password' ? 'text-accent-400' : 'text-gray-500'}`} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className="input-dark w-full pl-12 pr-12 transition-all duration-200 focus:scale-[1.02]"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-accent-400 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-accent-500 focus:ring-accent-500 focus:ring-offset-dark-900" />
                    <span className="text-gray-400">Remember me</span>
                  </label>
                  <button type="button" className="text-accent-400 hover:text-accent-300 transition-colors">
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </form>

              {/* Security Notice */}
              <div className="text-center pt-6 border-t border-dark-600">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                  <Shield className="h-4 w-4 text-accent-400" />
                  <span>Secured with enterprise-grade encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;