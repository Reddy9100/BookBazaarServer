const Bookmodel = require("../model/uploadModel");

exports.UploadSliderBooks = async (req, res) => {
  try {
    const {
      title,
      picture,
      author,
      rating,
      price,
      description,
      category,
      
    } = req.body;

    if(!title || !picture || !author || !rating ||!price ||!description ||!category){
        return res.status(400).json({ message: "Please fill all the fields" });

    }

    const BooksData = new Bookmodel({
        title,
        picture,
        author,
        rating,
        price,
        description,
        category,
    })

    await BooksData.save()
    res.status(200).json({message:"Book Uploaded Successfully"})
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



exports.getBooks = async(req,res) =>{
    try{
        const BooksData = await Bookmodel.find();
        res.status(200).json(BooksData)
    }
    catch(e){
        console.log(e)
        res.status(500).json({message:"Internal Server Error"})
    }
}