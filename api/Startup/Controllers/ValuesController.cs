﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Net.Http.Headers;
using Files = System.IO.File;

namespace Startup.Controllers
{
    [Route("s/[controller]")]
    public class ValuesController : BaseController
    {

        public ValuesController(IHostingEnvironment env) : base(env) { }

        // GET api/values
        [HttpGet]
        public IActionResult Get(string file = null)
        {
            if (string.IsNullOrWhiteSpace(file))
            {
                return Forbid();
            }
            var path = Path.Combine(env.ContentRootPath, "uploads", file);
            if (!Files.Exists(path))
            {
                return NotFound(new { success = false, errormsg = $"File not found {file}" });
            }
            return new PhysicalFileResult(path, new MediaTypeHeaderValue(Mime.TypeOf(path)));
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }


        // POST api/values
        //[HttpPost]
        //public IActionResult Post(ICollection<IFormFile> files)
        //{
        //    try
        //    {
        //        WriteLog("PostFiles call received!");
        //        //We would always copy the attachments to the folder specified above but for now dump it wherver....
        //        long size = files.Sum(f => f.Length);

        //        // full path to file in temp location
        //        var filePath = Path.GetFullPath("uploads");

        //        if (!Directory.Exists(filePath))
        //        {
        //            Directory.CreateDirectory(filePath);
        //        }

        //        List<string> list = new List<string>();
        //        foreach (var formFile in files)
        //        {
        //            if (formFile.Length > 0)
        //            {
        //                var fileName = $"{filePath}\\{Path.GetFileName(formFile.FileName)}";
        //                using (var stream = new FileStream(fileName, FileMode.Create))
        //                {
        //                    list.Add($"http://localhost:8888/s/values?file={formFile.FileName}");
        //                    formFile.CopyTo(stream);
        //                }
        //            }
        //        }

        //        // process uploaded files
        //        // Don't rely on or trust the FileName property without validation.
        //        //Displaying File Name for verification purposes for now -Rohit

        //        return Ok(new { count = files.Count, files=list, size, filePath });
        //    }
        //    catch (Exception exp)
        //    {
        //        WriteLog("Exception generated when uploading file - " + exp.Message);
        //        string message = $"file / upload failed!";
        //        return Json(message);
        //    }
        //}

        // PUT api/values/5
        [HttpPost]
        public IActionResult Post(string n)
        {
            WriteLog($"Upload file received: {n}");
            var buf = new byte[4096];
            var path = Path.GetFullPath($"./uploads/{n}");
            try
            {
                using (var file = Files.Create(path))
                {
                    Request.Body.CopyTo(file);
                    file.Flush(true);
                    return Json(new { count = 1, files = new List<string> { $"http://localhost:8888/s/values?file={n}" }, success = "true" });
                }
            }
            catch (Exception exp)
            {
                WriteLog("Exception generated when uploading file - " + exp.Message);
                string message = $"file / upload failed!";
                return Json(new { success=false, errmsg=exp.Message, count=0 });
            }
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }




    }
}
