import { connect } from "mongoose";

connect("mongodb+srv://innovaid_db_user:yPHIdhAKZQmRmJgu@cluster0.bkuq4gu.mongodb.net/your_db_name?retryWrites=true&w=majority")
.then(() => console.log("Connected"))
.catch(err => console.log("Error:", err));
