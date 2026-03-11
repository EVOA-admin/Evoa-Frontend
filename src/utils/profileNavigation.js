export const goToProfile = (clickedUserId, currentUser, navigate) => {
    if (!clickedUserId) return;

    if (currentUser?.id === clickedUserId) {
        const role = currentUser?.role;
        if (role === 'investor') navigate('/investor/profile');
        else if (role === 'startup') navigate('/startup/profile');
        else if (role === 'incubator') navigate('/incubator/profile');
        else if (role === 'viewer') navigate('/viewer/profile');
        else navigate(`/u/${clickedUserId}`);
    } else {
        navigate(`/u/${clickedUserId}`);
    }
};
