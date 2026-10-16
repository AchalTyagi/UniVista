// Javascript
console.log("Javascript is successfully linked!");

const button = document.getElementById('myButton');

button.addEventListener('click', function(){
    button.style.backgroundColor = 'purple';
    button.textContent = 'Clicked!';
    alert('You interacted with the page!');
})