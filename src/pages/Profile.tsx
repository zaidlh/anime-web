import React from 'react';
import { useAuth } from '../lib/useAuth';
import { useMyList } from '../lib/list';
import { useToast } from '../components/Toast';

export default function Profile() {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const { list, loading: listLoading } = useMyList();
  const { showToast } = useToast();

  if (loading) {
    return (
      <div className="max-w-[600px] mx-auto px-margin-edge py-xl flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Format Joined Date
  const joinedDate = user?.metadata?.creationTime
    ? `JOINED ${new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}`
    : 'JOINED RECENTLY';

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Signed out successfully');
    } catch (e) {
      showToast('Error signing out', 'error');
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      showToast('Signed in successfully', 'success');
    } catch (e) {
      showToast('Error signing in', 'error');
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto px-margin-edge flex flex-col items-center relative pb-20">
      
      {user ? (
        <>
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-8 mt-6 w-full">
            <div className="relative mb-4">
              <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-full border-[3px] border-primary overflow-hidden bg-surface-container shadow-[0_0_20px_rgba(255,77,77,0.2)] flex items-center justify-center p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-surface-variant">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'Profile'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-[48px] sm:text-[64px] text-on-surface-variant flex items-center justify-center w-full h-full">person</span>
                  )}
                </div>
              </div>
              <div className="absolute bottom-1 -right-1 sm:bottom-2 sm:-right-0 bg-primary text-black text-[10px] sm:text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-lg">
                VIP
              </div>
            </div>
            
            <h1 className="font-display-lg text-[28px] md:text-[32px] font-bold text-white mb-1">
              {user.displayName || 'Anonymous'}
            </h1>
            <p className="text-on-surface-variant text-[12px] font-bold tracking-widest uppercase">
              {joinedDate}
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 w-full bg-surface-container-low border border-surface-variant rounded-xl p-5 mb-8">
            <div className="flex flex-col items-center border-r border-surface-variant">
              <span className="text-primary font-medium text-[20px] mb-1">12.4k</span>
              <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">Minutes</span>
            </div>
            <div className="flex flex-col items-center border-r border-surface-variant">
              <span className="text-primary font-medium text-[20px] mb-1">{listLoading ? '-' : list.length}</span>
              <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">Series</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-primary font-medium text-[20px] mb-1">312</span>
              <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">Followers</span>
            </div>
          </div>

          {/* My Stats Chart */}
          <div className="w-full mb-8">
            <h3 className="text-white text-[20px] font-medium mb-4">My Stats</h3>
            <div className="bg-surface-container-low border border-surface-variant rounded-xl p-5 w-full">
              <div className="flex items-end justify-between h-[120px] mb-6 gap-2 border-b border-surface-variant/50 pb-2">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => {
                  const h = [35, 55, 75, 100, 60, 45, 60][i];
                  const isActive = i === 3;
                  return (
                    <div key={day} className="flex flex-col items-center flex-1 gap-3 h-full justify-end">
                      <div 
                        className={`w-full max-w-[32px] rounded-t-md transition-all ${isActive ? 'bg-primary shadow-[0_0_15px_rgba(255,77,77,0.3)]' : 'bg-surface-variant'}`} 
                        style={{ height: `${h}%` }}
                      ></div>
                      <span className={`text-[10px] font-bold ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>{day}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wider mb-1">This Week</div>
                  <div className="text-white text-[24px] font-medium leading-none">18h 42m</div>
                </div>
                <div className="bg-primary/20 border border-primary/30 text-primary text-[11px] font-bold px-2 py-1 rounded-sm shadow-sm">
                  +12% vs last week
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="w-full mb-8">
            <h3 className="text-white text-[20px] font-medium mb-4">Achievements</h3>
            <div className="flex overflow-x-auto gap-4 no-scrollbar pb-2 -mx-margin-edge px-margin-edge md:mx-0 md:px-0">
              <div className="shrink-0 flex flex-col items-center justify-center bg-surface-container-low border border-primary/50 text-white rounded-xl w-[120px] h-[120px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 relative z-10">
                  <span className="material-symbols-outlined text-primary text-[24px]">magic_button</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest relative z-10">Genre Master</span>
              </div>
              
              <div className="shrink-0 flex flex-col items-center justify-center bg-surface-container-low border border-surface-variant text-on-surface-variant rounded-xl w-[120px] h-[120px] hover:border-outline transition-colors">
                <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[24px]">wb_twilight</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Early Bird</span>
              </div>

              <div className="shrink-0 flex flex-col items-center justify-center bg-surface-container-low border border-surface-variant text-on-surface-variant rounded-xl w-[120px] h-[120px] hover:border-outline transition-colors">
                <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[24px]">local_fire_department</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">30 Day Streak</span>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="w-full mb-10">
            <h3 className="text-white text-[20px] font-medium mb-4">Account Settings</h3>
            <div className="bg-surface-container-low border border-surface-variant rounded-xl overflow-hidden divide-y divide-surface-variant">
              {[
                { icon: 'edit', text: 'Edit Profile' },
                { icon: 'subscriptions', text: 'Subscription Plan' },
                { icon: 'download', text: 'Downloads' },
                { icon: 'settings', text: 'App Settings' },
                { icon: 'help', text: 'Help Center' }
              ].map((item, idx) => (
                <button key={idx} className="w-full flex items-center justify-between p-4 px-5 hover:bg-surface-variant transition-colors group">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span className="text-white font-medium text-[15px]">{item.text}</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </button>
              ))}
            </div>
          </div>

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className="text-on-surface-variant text-[12px] font-bold uppercase tracking-widest mb-8 hover:text-primary transition-colors py-4 px-8"
          >
            Logout Account
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center mt-[10vh] text-center max-w-sm">
          <div className="w-24 h-24 rounded-full bg-surface-container border border-surface-variant flex items-center justify-center mb-8 shadow-2xl relative">
              <span className="material-symbols-outlined text-[48px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '3s' }}></div>
          </div>
          <h1 className="font-display-lg text-[32px] font-bold text-white mb-3">Your Catalog awaits</h1>
          <p className="text-on-surface-variant mb-10 text-base leading-relaxed">
            Sign in to track your watch history, save your favorite series, and unlock exclusive VIP features across all devices.
          </p>
          <button 
            onClick={handleLogin}
            className="bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-full font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-3 active:scale-95 w-full justify-center"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google logo" />
            Continue with Google
          </button>
        </div>
      )}
    </div>
  );
}
