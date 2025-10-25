import { useState } from 'react';
import ViewProfileScreen from './ViewProfileScreen/ViewProfileScreen';
import ChangeNameScreen from './ChangeNameScreen/ChangeNameScreen';
import ChangePasswordScreen from './ChangePasswordScreen/ChangePasswordScreen';

export default function UpdateProfileScreen({ onBack, session }) {
  const [profileScreen, setProfileScreen] = useState('view'); // 'view' | 'changeName' | 'changePassword'

  const handleChangeName = () => {
    setProfileScreen('changeName');
  };

  const handleChangePassword = () => {
    setProfileScreen('changePassword');
  };

  const handleBackToProfile = () => {
    setProfileScreen('view');
  };

  return (
    <>
      {profileScreen === 'view' && (
        <ViewProfileScreen
          session={session}
          onChangeName={handleChangeName}
          onChangePassword={handleChangePassword}
          onBack={onBack}
        />
      )}

      {profileScreen === 'changeName' && (
        <ChangeNameScreen
          session={session}
          onBack={handleBackToProfile}
        />
      )}

      {profileScreen === 'changePassword' && (
        <ChangePasswordScreen
          session={session}
          onBack={handleBackToProfile}
        />
      )}
    </>
  );
}