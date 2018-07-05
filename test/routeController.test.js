var expect = require('expect');
var assert = require('chai').assert;
var chai = require('chai');
const request = require('supertest');
var chaiHttp = require('chai-http');

var server = require('../app');
chai.use(chaiHttp);

describe('#main router', () => {
    it('should go to routeController', (done) => {
        request(server)
        .get('/')
        .expect(200)
        .expect('Content-Type', /json/)
         .expect((res) => {
        
            expect(res.body).toEqual({
                message: 'Inside The  routes' 
            })
        })
        .end(done);
    });
});

describe('#check user router',() => {
    it('should go to user route', (done) => {
    request(server)
    .get('/check')
    .expect(200)
    .expect('Content-Type','application/json; charset=utf-8')
    .expect((res) => {
        console.log('user check respose',res.body)
    })
    .end(done)

    });

    describe('#sub child  user route ', () => {
        it('should go to userworkjs', (done) =>{
            request(server)
            .get('/check/user')
            .expect(200)
            .expect('Content-Type','application/json; charset=utf-8')
            .expect((res) => {
                console.log("check user work js ",res.body);
            })
            .end(done);
        });

        // it('should go to check login' ,(done) => {
            
        //     request(server)
        //     .post('/check/user/login')
        //     .send({
        //         email:'user1@gmail.com',
        //         password:'123456'
        //     })
        //     .expect(200)
        //     .expect('Content-Type','application/json; charset=utf-8')
        //     .expect((res) => {
                
        //         expect(res.body.success).toContain("Succes Login");
        //     })
        //     .end(done);
        //     // .end((err,res) => {
        //     //     if(err) throw done(err);
        //     //     expect(res.status).toContainEqual(200);
        //     //  done();
        //     // })
        // });
    });


    describe('#utilty', () => {
        
        it('should go to utility and get palyer',(done) => {
            request(server)
            .get('/check/utility/player')
            .expect(200)
            .expect('Content-Type','application/json; charset=utf-8')
            .expect((res) => {
                
                expect(res.body.players).toContainEqual({
                        "__v": 0,
                        _id: '5b2215da2be2f3329804057e',
                        playerName: 'Hardik Pandya',
                        playerType: 'Allrounder',
                        profileImage: 'http://cricapi.com/playerpic/625371.jpg',
                        profileDescription: '\n\nHardik Pandya swears by living life king size and that exuberance finds expression in his powerful hitting in the middle order and brisk seam bowling. He first caught the eye with an unbeaten 31-ball 61 for Mumbai Indians against Kolkata Knight Riders in IPL 2015, but displayed greater consistency in the Syed Mushtaq Ali domestic T20 tournament in January 2016. He finished as the leading run-getter, for Baroda, with 377 runs in 10 innings at an average of 53.85.  \n\n',
                        playerAPIId: '625371',
                        playerFlag: true,
                        createdDate: '2018-06-14T07:14:34.321Z' 
                });
            })  
            .end(done);
        });

        it('should get like val', (done) => {
            var idval ={id:"5b2a75007f50ac3e086711a4"};
            request(server)
            .post('/check/utility/getCountLDval')
            .send(idval)
            .expect(200)
            .expect('Content-Type','application/json; charset=utf-8')
            
            .end(done)
        });
    
    })
});