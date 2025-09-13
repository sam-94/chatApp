export default (err, req, res, next) => {
    res.status(err.status || 500).json({ "success": "False", error: err.message, "message": 'Internal Server Error' });
  };
  