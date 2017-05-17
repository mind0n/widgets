using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Cors;

namespace Startup.Controllers
{
    [Route("s/[controller]")]
    [EnableCors("localhost")]
    public class ValuesController : Controller
    {
        // GET api/values
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/values
        [HttpPost]
        public IActionResult Post(ICollection<IFormFile> files)
        {
            try
            {
                WriteLog("PostFiles call received!");
                //We would always copy the attachments to the folder specified above but for now dump it wherver....
                long size = files.Sum(f => f.Length);

                // full path to file in temp location
                var filePath = Path.GetFullPath("./uploads");

                if (!Directory.Exists(filePath))
                {
                    Directory.CreateDirectory(filePath);
                }

                List<string> list = new List<string>();
                foreach (var formFile in files)
                {
                    if (formFile.Length > 0)
                    {
                        var fileName = $"{filePath}\\{formFile.FileName}";
                        using (var stream = new FileStream(fileName, FileMode.Create))
                        {
                            list.Add(fileName);
                            formFile.CopyTo(stream);
                        }
                    }
                }

                // process uploaded files
                // Don't rely on or trust the FileName property without validation.
                //Displaying File Name for verification purposes for now -Rohit

                return Ok(new { count = files.Count, files=list, size, filePath });
            }
            catch (Exception exp)
            {
                WriteLog("Exception generated when uploading file - " + exp.Message);
                string message = $"file / upload failed!";
                return Json(message);
            }
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }

        /// <summary>
        /// Writes a log entry to the local file system
        /// </summary>
        /// <param name="message">Message to be written to the log file</param>
        /// <param name="InsertNewLine">Inserts a new line</param>
        public void WriteLog(string message)
        {
            Console.WriteLine(message);
        }
    }
}
