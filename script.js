'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Sheldon Cooper',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2020-11-18T21:31:17.178Z',
    '2020-12-23T07:42:02.383Z',
    '2021-01-28T09:15:04.904Z',
    '2021-04-01T10:17:24.185Z',
    '2021-05-08T14:11:59.604Z',
    '2021-05-27T17:01:17.194Z',
    '2021-09-30T23:36:17.929Z',
    '2021-10-05T10:51:36.790Z',
  ],
  currency: 'SGD',
  locale: 'en-gb', // de-DE
};

const account2 = {
  owner: 'Leonard Hofstadter',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2020-11-01T13:15:33.035Z',
    '2020-11-30T09:48:16.867Z',
    '2020-12-25T06:04:23.907Z',
    '2021-01-25T14:18:46.235Z',
    '2021-02-05T16:33:06.386Z',
    '2021-04-10T14:43:26.374Z',
    '2021-10-04T18:49:59.371Z',
    '2021-10-05T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-us',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function(date, locale) {
  const calcDaysPassed = (date1, date2) => 
    Math.round(Math.abs((date2 - date1))/(1000*60*60*24));
  const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 4));

  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);
  
  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2,0);
  // const month = `${date.getMonth()+1}`.padStart(2,0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
}

const formatCur = function(value, locale, currency){
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

const displayMovements = function(acc, sort=false){
  //empty container
  containerMovements.innerHTML = "";

  //sort by ascending
  const movs = sort ? acc.movements.slice().sort((a, b) => a-b) : acc.movements;

  //add movements
  movs.forEach(function(mov, i){
    const type = mov > 0 ? "deposit" : "withdrawal";

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i+1} ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

//display balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc+mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

//display summary statistics

const calcDisplaySummary = function(acc){
  const income = acc.movements
    .filter(mov => mov >0)
    .reduce((acc, mov)=> acc+mov, 0);
    labelSumIn.textContent = formatCur(income, acc.locale, acc.currency);

  const outflow = acc.movements
    .filter(mov=> mov<0)
    .reduce((acc, mov)=> acc+mov, 0);
    labelSumOut.textContent = formatCur(Math.abs(outflow), acc.locale, acc.currency);;
  
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit*acc.interestRate)/100)
    .filter((int, i, arr)=> {
      return int >=1;
    })
    .reduce((acc, int)=> acc+int, 0);
    labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

//create usernames
const createUsernames = function(accs){
  accs.forEach(function(acc){
    acc.username = acc.owner
    .toLowerCase() 
    .split(" ")
    .map((name)=>name[0])
    .join("");
  });
};
createUsernames(accounts);

const updateUI = function(acc){
  //Display movements
  displayMovements(acc);

  //Display balance
  calcDisplayBalance(acc);

  //Display summary stats
  calcDisplaySummary(acc);
};

const startLogOutTimer = function(){
  const tick = function(){
    const min =String(Math.trunc(time/60)).padStart(2,0);
    const sec = String(time % 60).padStart(2,0);
    //in each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;
    
    //when 0 seconds, stop timer and log out user
    if (time === 0){
      clearInterval(timer);
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }

    //decrease 1s
    time--;
  }
  //set time to 5 minutes
  let time = 30;
  //call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

//Event Handler
let currentAccount, timer; 

//Fake always log in
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener("click", function(e){
  //prevent form from submitting
  e.preventDefault();
  
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value){
    //Display UI and message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(" ")[0]}`;
    containerApp.style.opacity = 100;

    //create current date and time
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long"
    };
    const locale = navigator.language;

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale, 
      options
      ).format(now);
    // const day = `${now.getDate()}`.padStart(2,0);
    // const month = `${now.getMonth()+1}`.padStart(2,0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2,0);
    // const min = `${now.getMinutes()}`.padStart(2,0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    

    //clear input fields and lose focus
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginUsername.blur();
    inputLoginPin.blur();

    //start log out timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    //Update UI
    updateUI(currentAccount);
  };
});

btnTransfer.addEventListener("click", function(e){
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = "";


  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ){
    //Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    //Update UI
    updateUI(currentAccount);

    //Reset Timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

//sort by ascending value
let sorted = false;
btnSort.addEventListener("click", function(e){
  e.preventDefault();
  displayMovements(currentAccount.acc, !sorted);
  sorted = !sorted;
})


//only grant a loan if there is at least 1 deposit of at least 10% of your loan amount
//loan granted after 2.5s
btnLoan.addEventListener("click", function(e){
  e.preventDefault();
  const amount = Math.floor(+(inputLoanAmount.value));


  if (amount > 0 && currentAccount.movements.some(mov => mov>= amount*0.1)){

    setTimeout(function(){
      
      //add movement
      currentAccount.movements.push(amount);
      
      //add loan date
      currentAccount.movementsDates.push(new Date().toISOString());
      
      //update UI
      updateUI(currentAccount);

      //Reset Timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500)
  }
  else if (currentAccount.movements.some(mov => mov<amount*0.1)){
    //display alert message that there is insufficient funds for the loan
    alert("You need to have a deposit amount of at least 10% of the requested loan")
  };
  inputLoanAmount.value = "";
})

//Close account
btnClose.addEventListener("click", function(e){
  e.preventDefault();

  if (currentAccount.username === inputCloseUsername.value &&
    currentAccount?.pin === +(inputClosePin.value)
  ){
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);

    //Delete account
    accounts.splice(index, 1);

    //Hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = "";
});
