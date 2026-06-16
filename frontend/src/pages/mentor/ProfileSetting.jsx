import { Navigate } from 'react-router-dom'

/** Legacy route — editing lives on /mentor/edit-profile */
const ProfileSetting = () => <Navigate to="/mentor/edit-profile" replace />

export default ProfileSetting
