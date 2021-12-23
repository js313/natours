const stripe = Stripe('pk_test_51K7RoDLD22a8AcLBtllQONXKeXq3rd72kFOsjuGXqijwJCFZBRpypp7V0OcRZOMHZMB7Rou6OKMDQBbB8PvxnJF300HglL3oSX')

const bookTour = async tourId => {
    try {
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`)
        console.log(session)

        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch(err) {
        console.log(err)
        showAlert('error', err)
    }
}

const bookButton = document.getElementById('book-tour')

if(bookButton) {
    bookButton.addEventListener('click', event => {
        event.target.textContent = 'Processing...'
        const { tourId } = event.target.dataset
        bookTour(tourId)
    })
}

const alertMessage = document.querySelector('body').dataset.alert
if(alertMessage) showAlert('success', alertMessage)