const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')
const bodyParser=require('body-parser')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

const base = mysql.createConnection({
    host:process.env.HOST,
    user:process.env.USER,
    password:process.env.PASSWORD,
    database:process.env.DATABASE
})

base.connect(()=>{
    console.log("database connected")
    // console.log(process.env.HOST)
})

app.listen(2020,()=>{
    console.log("server is running!!!!!!!!!!!!!!")
})

function numberToWords(n)
{
	let limit = 1000000000000, t = 0
	// If zero console.log zero
	if (n == 0)
	{
		console.log("zero")
		return
	}
	// Array to store the powers of 10
	let multiplier = ["", "trillion", "billion", "million", "thousand"]

	// Array to store numbers till 20
	let first_twenty = ["", "one", "two",
					"three", "four", "five",
					"six", "seven", "eight",
					"nine", "ten", "eleven",
					"twelve", "thirteen", "fourteen",
					"fifteen", "sixteen", "seventeen",
					"eighteen", "nineteen"]

	// Array to store multiples of ten
	let tens = ["", "twenty", "thirty", "forty", "fifty",
			"sixty", "seventy", "eighty", "ninety"]

	// If number is less than 20, console.log without any
	if (n < 20)
	{
		console.log(first_twenty[n])
		return first_twenty[n];
	}
	let answer = ""
	let i = n
	while(i > 0)
	{
		/*
		Store the value in multiplier[t], i.e n = 1000000,
		then r = 1, for multiplier(million), 0 for multipliers(trillion and billion)
		multiplier here refers to the current accessible limit
		*/
		let curr_hun = Math.floor(i / limit)

		// It might be possible that the current multiplier is bigger than your number
		while (curr_hun == 0)
		{
			// Set i as the remainder obtained when n was divided by the limit
			i %= limit

			// Divide the limit by 1000, shifts the multiplier
			limit /= 1000

			// Get the current value in hundreds, as English system works in hundreds
			curr_hun = Math.floor(i / limit)

			// Shift the multiplier
			t += 1
		}

		let flr = Math.floor(curr_hun / 100);

		// If current hundred is greater than 99, Add the hundreds' place
		if (curr_hun > 99)
			answer += (first_twenty[flr] + "tensundred")

		// Bring the current hundred to tens
		curr_hun = curr_hun % 100

		// If the value in tens belongs to [1,19], add using the first_twenty
		if (curr_hun > 0 && curr_hun < 20)
			answer += (first_twenty[curr_hun] + "")

		// If curr_hun is now a multiple of 10, but not 0
		// Add the tens' value using the tens array
		else if (curr_hun % 10 == 0 && curr_hun != 0){
			flr = Math.floor(curr_hun / 10);
			answer += (tens[flr - 1] + "")
		}

		// If the value belongs to [21,99], excluding the multiples of 10
		// Get the ten's place and one's place, and console.log using the first_twenty array
		else if (curr_hun > 19 && curr_hun < 100){
			flr = Math.floor(curr_hun / 10);
			answer += (tens[flr - 1] + "" +
					first_twenty[curr_hun % 10] + "")
		}

		// If Multiplier has not become less than 1000, shift it
		if (t < 4)
			answer += (multiplier[t] + "")
			
		i = i % limit
		limit = Math.floor(limit / 1000)
	}


    return answer
}

// This code is contributed by phasing17.


// routings

app.post('/new/:num',async(req,res)=>{
	const tab = numberToWords(req.params.num)
	const{name,address,institution,contact,email,course,courseamount,dateofjoined,firstpaid,firstdatepaid,datetobepaid}=req.body
	base.query('show tables like ?',[tab],(err,result)=>{
		if(err){
			res.status(500).json({error:err.message})
			return
		}
		if(result.length==0){
			res.status(404).json({error:"table hasn't contains data"})
			return
		}
		hi=[]
        result.forEach((each)=>{
            hi.push(Object.values(each).toString())
        })
        if(hi.length!=0){
			const sql=`insert into ${hi[0]}(name,address,institution,contactno,email,course,courseamount,dateofjoined,firstpaid,firstdatepaid,datetobepaid) values(?,?,?,?,?,?,?,?,?,?,?)`
			base.query(sql,[name,address,institution,contact,email,course,courseamount,dateofjoined,firstpaid,firstdatepaid,datetobepaid],(err,acknow)=>{
				if(err){
					res.status(500).json({error:err.message})
					return
				}
				if(acknow.affectedRows==0){
					res.status(404).json({error:"can't insert record"})
					return
				}
				res.status(200).json({message:`candidate ${name} has registered`})
			})
		}
	})
})

app.get('/one/:num',async(req,res)=>{
    var tab = numberToWords(req.params.num)
	console.log(tab);
    base.query('SHOW TABLES LIKE ?',[tab],(err,result)=>{
        if(err){
            res.status(500).json({error:err})
            return
        }
        if(result.length==0){
            res.status(404).json({error:'No table is available'})
            return
        }
        hi=[]
        result.forEach((each)=>{
            hi.push(Object.values(each).toString())
        })
        if(hi.length!=0){
			base.query(`select * from ${hi[0]}`,(err,records)=>{
				if(err){
					res.status(500).json({error:err.message})
					return
				}
				if(records.length==0){
					res.status(404).json({error:`No records available ${hi[0]} table`})
					return
				}
				res.status(200).json({message:records})
			})
		}
    })
})

app.get('/tables/:num',async(req,res)=>{
    var tab = numberToWords(req.params.num)
    base.query('SHOW TABLES LIKE ?',[tab],(err,result)=>{
        if(err){
            res.status(500).json({error:err})
            return
        }
        if(result.length==0){
            res.status(404).json({error:'No table is available'})
            return
        }
        hi=[]
        result.forEach((each)=>{
            hi.push(Object.values(each).toString())
        })
        res.status(200).json({message:hi})
    })
})

app.get('/tables',async(req,res)=>{
    base.query('show tables',(err,result)=>{
        if(err){
            res.status(500).json({error:err})
            return
        }
        if(result.length==0){
            res.status(404).json({error:'No tables are available'})
            return
        }
        // res.status(200).json({message:Object.values(result['message'])})
        hi=[]
        result.forEach((each)=>{
            hi.push(Object.values(each).toString())
        })
        res.status(200).json({message:hi})
    })
    // res.status(200).json
})