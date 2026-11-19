require('dotenv').config();
const express=require('express'),cors=require('cors');
const app=express();app.use(cors());app.use(express.json());
function rule(m){m=m.toLowerCase();
 if(/fraction|பின்ன/.test(m))return 'Fractions: make denominators equal before adding. 1/2 + 1/4 = 3/4.';
 if(/ratio|விகித/.test(m))return 'Ratio: simplify by dividing by the HCF. 12:18 = 2:3.';
 if(/percent|%|சதவீத/.test(m))return 'Percentage: x% of N = (x/100) × N. 25% of 200 = 50.';
 return 'I can help with Fractions, Ratio and Percentages. Try "explain ratio".'}
app.get('/api/health',(q,r)=>r.json({ok:true,ai:!!process.env.ANTHROPIC_API_KEY}));
app.post('/api/chat',async(req,res)=>{
 const {message='',lang='en'}=req.body;
 if(!process.env.ANTHROPIC_API_KEY)return res.json({reply:rule(message),mode:'rule-based'});
 try{
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',
   headers:{'x-api-key':process.env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01','content-type':'application/json'},
   body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:400,
    system:'You are VidyaSetu, a friendly maths tutor for school students (Fractions, Ratio, Percentages). Keep answers short and simple. Reply in '+(lang==='ta'?'Tamil':'English')+'.',
    messages:[{role:'user',content:message}]})});
  const d=await r.json();res.json({reply:d.content[0].text,mode:'ai'});
 }catch(e){res.json({reply:rule(message),mode:'fallback'})}
});
app.listen(process.env.PORT||5000,()=>console.log('VidyaSetu API running'));