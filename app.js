
const SUPABASE_URL = "https://zlafcarhdhtugcmeaqzv.supabase.co";
const SUPABASE_KEY = "sb_publishable_msVVLrRWTYHKAnia15J-Pw_nDdcK3Mb";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);




const questions = [
  {topic:'一元一次方程', title:'解一元一次方程', text:'解方程： 3x + 5 = 20', answer:'5', hint:'先把 + 5 移到等號右邊，兩邊同時減 5。', solution:'3x + 5 = 20<br>3x = 20 − 5<br>3x = 15<br>x = 15 ÷ 3 = <strong>5</strong>'},
  {topic:'代數式', title:'合併同類項', text:'化簡： 4a + 3a − 2', answer:'7a-2', accepted:['7a-2','7a − 2','7a–2'], hint:'只有含有 a 的項才可以合併；常數 −2 保持不變。', solution:'4a 和 3a 都含有 a，所以可以相加：<br>4a + 3a − 2 = <strong>7a − 2</strong>'},
  {topic:'百分數', title:'計算折扣後售價', text:'原價 $200 的物品減價 15%，售價是多少？', answer:'170', hint:'先找出折扣金額：原價的 15%。', solution:'折扣 = 200 × 15% = 30<br>售價 = 200 − 30 = <strong>$170</strong>'},
  {topic:'幾何', title:'三角形內角', text:'一個三角形的兩個內角是 45° 和 70°。第三個內角是多少度？', answer:'65', hint:'任何三角形的三個內角加起來都是 180°。', solution:'第三個內角 = 180° − 45° − 70°<br>= <strong>65°</strong>'},
  {topic:'數據處理', title:'計算平均數', text:'數據為 4、6、8、10、12，它們的平均數是多少？', answer:'8', hint:'把所有數字相加，再除以數據的個數。', solution:'總和 = 4 + 6 + 8 + 10 + 12 = 40<br>平均數 = 40 ÷ 5 = <strong>8</strong>'}
];
let active = 0; const done = new Set();
const $ = id => document.getElementById(id);
function clean(v){return v.toLowerCase().replace(/\s/g,'').replace(/−|–/g,'-').replace(/\$/g,'')}
function renderList(){ $('questionList').innerHTML = questions.map((q,i)=>`<button class="question-item ${i===active?'active':''} ${done.has(i)?'done':''}" data-index="${i}"><span class="num">${done.has(i)?'✓':i+1}</span><span>${q.topic}<small>${q.title}</small></span></button>`).join(''); document.querySelectorAll('.question-item').forEach(b=>b.onclick=()=>load(+b.dataset.index)); }
function load(i){active=i;const q=questions[i];$('questionTopic').textContent=q.topic;$('questionTitle').textContent=q.title;$('questionText').textContent=q.text;$('questionNumber').textContent=`第 ${i+1} / ${questions.length} 題`;$('answer').value='';$('feedback').textContent='';$('feedback').className='feedback';$('solution').className='solution';$('solution').innerHTML='';renderList();}
function progress(){const n=done.size;$('headerProgress').textContent=`${n} / 5`;$('streak').textContent=n?1:0;}
$('checkAnswer').onclick=()=>{const q=questions[active], value=clean($('answer').value), valid=[q.answer,...(q.accepted||[])].map(clean).includes(value), f=$('feedback');if(!value){f.textContent='先輸入你的答案吧。';f.className='feedback wrong';return}if(valid){done.add(active);f.textContent='答對了！你已完成這一題。';f.className='feedback correct';renderList();progress()}else{f.textContent='差一點點，再看看提示，慢慢來。';f.className='feedback wrong'}};
$('answer').addEventListener('keydown',e=>{if(e.key==='Enter')$('checkAnswer').click()});
$('hintButton').onclick=()=>{$('feedback').textContent='提示：'+questions[active].hint;$('feedback').className='feedback'};
$('solutionButton').onclick=()=>{const el=$('solution');el.innerHTML='<strong>解題步驟</strong><br>'+questions[active].solution;el.classList.toggle('visible')};
document.querySelectorAll('.topic-card').forEach(card=>card.onclick=()=>{const i=questions.findIndex(q=>q.topic.includes(card.dataset.topic)||card.dataset.topic==='代數'&&(q.topic==='一元一次方程'||q.topic==='代數式'));load(i<0?0:i);location.hash='practice';});
renderList();load(0);progress();
async function loadLeaderboard() {
  const leaderboardBody =
    document.getElementById("leaderboard-body");

  if (!leaderboardBody) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("leaderboard")
    .select("username, score, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(20);

  if (error) {
    console.error("讀取排行榜失敗：", error);

    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="3">排行榜讀取失敗</td>
      </tr>
    `;

    return;
  }

  if (!data || data.length === 0) {
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="3">目前還沒有分數</td>
      </tr>
    `;

    return;
  }

  leaderboardBody.innerHTML = "";

  data.forEach((player, index) => {
    const row = document.createElement("tr");

    const rankCell = document.createElement("td");
    rankCell.textContent = index + 1;

    const usernameCell = document.createElement("td");
    usernameCell.textContent = player.username;

    const scoreCell = document.createElement("td");
    scoreCell.textContent = player.score;

    row.appendChild(rankCell);
    row.appendChild(usernameCell);
    row.appendChild(scoreCell);

    leaderboardBody.appendChild(row);
  });
}

loadLeaderboard();
