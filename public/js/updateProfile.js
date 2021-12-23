const updateUserProfile = async (btn, data) => {
    try {
        const user = await axios({
            method: 'PATCH',
            url: '/api/v1/users/updateCurrentUser',
            data
        })
        if(user) {
            showAlert('success', "Profile Updated Successfully")
        }
    } catch(err) {
        showAlert('error', err.response.data.message)
    }
    transitionDone(btn, "Save settings")
}

const updateUserPassword = async (btn, currentPassword, newPassword, confirmPassword) => {
    try {
        const user = await axios({
            method: 'PATCH',
            url: '/api/v1/users/updatePassword',
            data: {
                currentPassword,
                newPassword,
                confirmPassword
            }
        })
        if(user) {
            showAlert('success', "Password Updated Successfully")
            UpdatePassword.reset()
        }
    } catch(err) {
        showAlert('error', err.response.data.message)
    }
    transitionDone(btn, "Save password")
}

function transition(btn) {
    btn.textContent = 'Updating...'
}
function transitionDone(btn, text) {
    btn.textContent = text
}

const UpdateForm = document.querySelector('.form-user-data')
const UpdatePassword = document.querySelector('.form-user-settings')

if(UpdateForm) {
    UpdateForm.addEventListener('submit', event => {
        const btn = document.querySelector('.btn--save-settings')
        transition(btn)
        event.preventDefault()
        const form = new FormData();
        form.append('name', document.getElementById('name').value)
        form.append('email', document.getElementById('email').value)
        form.append('photo', document.getElementById('photo').files[0])
        updateUserProfile(btn, form)
    })
}

if(UpdatePassword) {
    UpdatePassword.addEventListener('submit', event => {
        const btn = document.querySelector('.btn--save-password')
        transition(btn)
        event.preventDefault()
        const currentPassword = document.getElementById('password-current').value
        const newPassword = document.getElementById('password').value
        const confirmPassword = document.getElementById('password-confirm').value
        updateUserPassword(btn, currentPassword, newPassword, confirmPassword)
    })
}