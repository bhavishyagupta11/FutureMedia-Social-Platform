import React, { useEffect } from 'react'
import PostSide from '../../components/PostSide/PostSide'
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import ProfileLeft from '../../components/ProfileLeft/ProfileLeft'
import RightSide from '../../components/RightSide/RightSide'
import './Profile.css'
import { useNavigate } from 'react-router-dom'
const Profile = () => {
const navigate = useNavigate()
useEffect(() => {
if (!localStorage.getItem("userId")) {
navigate("/")
}
}, [navigate])
return (
<div className="Profile">
<ProfileLeft />
<div className="Profile-center">
<ProfileCard />
<PostSide />
</div>
<RightSide />
</div>
)
}
export default Profile
