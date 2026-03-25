var numbers=[5,2,4,6,1,3];
console.log(numbers);
var max=-1;
numbers.forEach((num)=> (num>max) ? max=num : max=max);
console.log(max);
