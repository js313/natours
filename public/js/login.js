const login = async (email, password) => {
    try{
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        })
        if(res.data.status === 'success') {
            showAlert('success', 'Logged in successfully')
            location.assign('/')
        }
    } catch(err) {
        console.log(err)
        showAlert('error', err.response.data.message)
        LoginForm.reset()
    }
}

const logout = async () => {
    try{
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout'
        })
        if(res.data.status === 'success') {
            showAlert('success', 'Logged out successfully')
            location.assign('/')
        }
    } catch(err) {
        console.log(err)
        showAlert('error', "Error logging out, please try again!")

    }
}

const LoginForm = document.querySelector('.form--login')
const LogoutBtn = document.querySelector('.nav__el--logout')

if(LoginForm) {
    LoginForm.addEventListener('submit', event => {
        event.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        login(email, password)
    })
}

if(LogoutBtn) {
    LogoutBtn.addEventListener('click', logout)
}