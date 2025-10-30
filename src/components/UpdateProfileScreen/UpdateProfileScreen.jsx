import { useState } from 'react';
import ViewProfileScreen from './ViewProfileScreen/ViewProfileScreen';
import ChangeNameScreen from './ChangeNameScreen/ChangeNameScreen';
import ChangePasswordScreen from './ChangePasswordScreen/ChangePasswordScreen';

export default function UpdateProfileScreen({ onBack, session, userName, setUserName }) {
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
          userName={userName}
        />
      )}

      {profileScreen === 'changeName' && (
        <ChangeNameScreen
          session={session}
          onBack={handleBackToProfile}
          userName={userName}
          setUserName={setUserName}
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