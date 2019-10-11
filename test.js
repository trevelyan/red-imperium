
  x = [1, 6, 3, 1242, 2];

//4, 2, 3, 5, 1

  let loop = x.length;
  let players = [];

  for (let i = 0; i < loop; i++) {
    let a = x.indexOf(Math.max(...x));
    x[a] = -1;
    players.push(a+1);
  }

console.log(players);
