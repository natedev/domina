goog.provide('domina.test');
goog.require('cljs.core');
goog.require('domina.xpath');
goog.require('domina.css');
goog.require('domina.events');
goog.require('domina');
goog.require('goog.events');

  window['tryfn'] = function(f) {
    return f.call();
    try {
      return f.call();
    } catch (e) {
      if(e == "fail hard") {
          throw e;
      } else {
          return e;
      }
    }
  };;
domina.test.tests = cljs.core.atom.call(null,cljs.core.Vector.fromArray([]));
domina.test.add_test = (function add_test(name,testfn){
return cljs.core.swap_BANG_.call(null,domina.test.tests,cljs.core.conj,cljs.core.Vector.fromArray([name,testfn]));
});
domina.test.run_test = (function run_test(testfn){
return tryfn.call(null,testfn);
});
domina.test.run_named = (function run_named(n){
return cljs.core.map.call(null,(function (p__6579){
var vec__6580__6581 = p__6579;
var name__6582 = cljs.core.nth.call(null,vec__6580__6581,0,null);
var testfn__6583 = cljs.core.nth.call(null,vec__6580__6581,1,null);

return cljs.core.Vector.fromArray([name__6582,domina.test.run_test.call(null,testfn__6583)]);
}),cljs.core.filter.call(null,(function (p__6584){
var vec__6585__6586 = p__6584;
var name__6587 = cljs.core.nth.call(null,vec__6585__6586,0,null);
var ___6588 = cljs.core.nth.call(null,vec__6585__6586,1,null);

return cljs.core._EQ_.call(null,name__6587,n);
}),cljs.core.deref.call(null,domina.test.tests)));
});
domina.test.run_tests = (function run_tests(){
return cljs.core.map.call(null,(function (p__6645){
var vec__6646__6647 = p__6645;
var name__6648 = cljs.core.nth.call(null,vec__6646__6647,0,null);
var testfn__6649 = cljs.core.nth.call(null,vec__6646__6647,1,null);

return cljs.core.Vector.fromArray([name__6648,domina.test.run_test.call(null,testfn__6649)]);
}),cljs.core.deref.call(null,domina.test.tests));
});
/**
* resets the page
*/
domina.test.reset = (function reset(){
return domina.destroy_BANG_.call(null,domina.xpath.xpath.call(null,"//body/*"));
});
/**
* Standard fixture html
*/
domina.test.standard_fixture = (function standard_fixture(){
return domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div class='d1'><p class='p1'>P1</p><p class='p2'>P2</p>\n<p id='id1' class='p3'>P3</p>");
});
domina.test.add_test.call(null,"basic CSS selection",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
if(cljs.core.truth_(cljs.core._EQ_.call(null,3,cljs.core.count.call(null,domina.nodes.call(null,domina.css.sel.call(null,"p"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",3,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'sel","p"),cljs.core.hash_map("﷐'line",67))),cljs.core.hash_map("﷐'line",67))),cljs.core.hash_map("﷐'line",67))),cljs.core.hash_map("﷐'line",67))))));
}
}));
domina.test.add_test.call(null,"basic CSS selection (single node)",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
if(cljs.core.truth_(cljs.core.instance_QMARK_.call(null,Element,domina.single_node.call(null,domina.css.sel.call(null,"p")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'instance?","﷑'js/Element",cljs.core.with_meta(cljs.core.list("﷑'single-node",cljs.core.with_meta(cljs.core.list("﷑'sel","p"),cljs.core.hash_map("﷐'line",72))),cljs.core.hash_map("﷐'line",72))),cljs.core.hash_map("﷐'line",72))))));
}
}));
domina.test.add_test.call(null,"CSS selection with class specification",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.css.sel.call(null,".d1"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'sel",".d1"),cljs.core.hash_map("﷐'line",77))),cljs.core.hash_map("﷐'line",77))),cljs.core.hash_map("﷐'line",77))),cljs.core.hash_map("﷐'line",77))))));
}
}));
domina.test.add_test.call(null,"a relative CSS selector",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
if(cljs.core.truth_(cljs.core._EQ_.call(null,3,cljs.core.count.call(null,domina.nodes.call(null,domina.css.sel.call(null,domina.css.sel.call(null,".d1"),"p"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",3,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'->",cljs.core.with_meta(cljs.core.list("﷑'sel",".d1"),cljs.core.hash_map("﷐'line",82)),cljs.core.with_meta(cljs.core.list("﷑'sel","p"),cljs.core.hash_map("﷐'line",83))),cljs.core.hash_map("﷐'line",82))),cljs.core.hash_map("﷐'line",82))),cljs.core.hash_map("﷐'line",82))),cljs.core.hash_map("﷐'line",82))))));
}
}));
domina.test.add_test.call(null,"extended CSS chaining",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.css.sel.call(null,"body"),"<div><p><span>some text</span></p><p><span>more text</span></p></div>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,2,cljs.core.count.call(null,domina.nodes.call(null,domina.css.sel.call(null,domina.css.sel.call(null,domina.css.sel.call(null,domina.css.sel.call(null,"body"),"div"),"p"),"span"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",2,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'->",cljs.core.with_meta(cljs.core.list("﷑'sel","body"),cljs.core.hash_map("﷐'line",89)),cljs.core.with_meta(cljs.core.list("﷑'sel","div"),cljs.core.hash_map("﷐'line",90)),cljs.core.with_meta(cljs.core.list("﷑'sel","p"),cljs.core.hash_map("﷐'line",91)),cljs.core.with_meta(cljs.core.list("﷑'sel","span"),cljs.core.hash_map("﷐'line",92))),cljs.core.hash_map("﷐'line",89))),cljs.core.hash_map("﷐'line",89))),cljs.core.hash_map("﷐'line",89))),cljs.core.hash_map("﷐'line",89))))));
}
}));
domina.test.add_test.call(null,"basic xpath selection",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
if(cljs.core.truth_(cljs.core._EQ_.call(null,3,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//p"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",3,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p"),cljs.core.hash_map("﷐'line",99))),cljs.core.hash_map("﷐'line",99))),cljs.core.hash_map("﷐'line",99))),cljs.core.hash_map("﷐'line",99))))));
}
}));
domina.test.add_test.call(null,"basic xpath selection (single node)",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
if(cljs.core.truth_(cljs.core.instance_QMARK_.call(null,Element,domina.single_node.call(null,domina.xpath.xpath.call(null,"//p")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'instance?","﷑'js/Element",cljs.core.with_meta(cljs.core.list("﷑'single-node",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p"),cljs.core.hash_map("﷐'line",104))),cljs.core.hash_map("﷐'line",104))),cljs.core.hash_map("﷐'line",104))))));
}
}));
domina.test.add_test.call(null,"xpath selection with class specification",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div[@class='d1']"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[@class='d1']"),cljs.core.hash_map("﷐'line",109))),cljs.core.hash_map("﷐'line",109))),cljs.core.hash_map("﷐'line",109))),cljs.core.hash_map("﷐'line",109))))));
}
}));
domina.test.add_test.call(null,"a relative xpath expression",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
if(cljs.core.truth_(cljs.core._EQ_.call(null,3,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,domina.xpath.xpath.call(null,"//body/div[@class='d1']"),"p"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",3,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'->",cljs.core.with_meta(cljs.core.list("﷑'xpath","//body/div[@class='d1']"),cljs.core.hash_map("﷐'line",114)),cljs.core.with_meta(cljs.core.list("﷑'xpath","p"),cljs.core.hash_map("﷐'line",115))),cljs.core.hash_map("﷐'line",114))),cljs.core.hash_map("﷐'line",114))),cljs.core.hash_map("﷐'line",114))),cljs.core.hash_map("﷐'line",114))))));
}
}));
domina.test.add_test.call(null,"extended selection chaining",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div><p><span>some text</span></p><p><span>more text</span></p></div>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,2,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,domina.xpath.xpath.call(null,domina.xpath.xpath.call(null,domina.xpath.xpath.call(null,"//body"),"div"),"p"),"span"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",2,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'->",cljs.core.with_meta(cljs.core.list("﷑'xpath","//body"),cljs.core.hash_map("﷐'line",121)),cljs.core.with_meta(cljs.core.list("﷑'xpath","div"),cljs.core.hash_map("﷐'line",122)),cljs.core.with_meta(cljs.core.list("﷑'xpath","p"),cljs.core.hash_map("﷐'line",123)),cljs.core.with_meta(cljs.core.list("﷑'xpath","span"),cljs.core.hash_map("﷐'line",124))),cljs.core.hash_map("﷐'line",121))),cljs.core.hash_map("﷐'line",121))),cljs.core.hash_map("﷐'line",121))),cljs.core.hash_map("﷐'line",121))))));
}
}));
domina.test.add_test.call(null,"advanced xpath",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
if(cljs.core.truth_(cljs.core._EQ_.call(null,2,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//p[following-sibling::p[@class='p3']]"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",2,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p[following-sibling::p[@class='p3']]"),cljs.core.hash_map("﷐'line",128))),cljs.core.hash_map("﷐'line",128))),cljs.core.hash_map("﷐'line",128))),cljs.core.hash_map("﷐'line",128))))));
}
}));
domina.test.add_test.call(null,"look up node by id",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.by_id.call(null,"id1"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'by-id","id1"),cljs.core.hash_map("﷐'line",133))),cljs.core.hash_map("﷐'line",133))),cljs.core.hash_map("﷐'line",133))),cljs.core.hash_map("﷐'line",133))))));
}
}));
domina.test.add_test.call(null,"look up nodes by class",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.by_class.call(null,"p3"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'by-class","p3"),cljs.core.hash_map("﷐'line",138))),cljs.core.hash_map("﷐'line",138))),cljs.core.hash_map("﷐'line",138))),cljs.core.hash_map("﷐'line",138))))));
}
}));
domina.test.add_test.call(null,"child selection",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
if(cljs.core.truth_(cljs.core._EQ_.call(null,3,cljs.core.count.call(null,domina.children.call(null,domina.xpath.xpath.call(null,"//div[@class='d1']"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",3,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'children",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[@class='d1']"),cljs.core.hash_map("﷐'line",143))),cljs.core.hash_map("﷐'line",143))),cljs.core.hash_map("﷐'line",143))),cljs.core.hash_map("﷐'line",143))))));
}
}));
domina.test.add_test.call(null,"clone a single node",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.clone.call(null,domina.single_node.call(null,domina.xpath.xpath.call(null,"//p")))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'clone",cljs.core.with_meta(cljs.core.list("﷑'single-node",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p"),cljs.core.hash_map("﷐'line",148))),cljs.core.hash_map("﷐'line",148))),cljs.core.hash_map("﷐'line",148))),cljs.core.hash_map("﷐'line",148))),cljs.core.hash_map("﷐'line",148))))));
}
}));
domina.test.add_test.call(null,"clone multiple nodes",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
if(cljs.core.truth_(cljs.core._EQ_.call(null,3,cljs.core.count.call(null,domina.clone.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//p")))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",3,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'clone",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p"),cljs.core.hash_map("﷐'line",153))),cljs.core.hash_map("﷐'line",153))),cljs.core.hash_map("﷐'line",153))),cljs.core.hash_map("﷐'line",153))),cljs.core.hash_map("﷐'line",153))))));
}
}));
domina.test.add_test.call(null,"append a single child to a single parent",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<p class='appended1'>test</p>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//body/p[@class='appended1']"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//body/p[@class='appended1']"),cljs.core.hash_map("﷐'line",159))),cljs.core.hash_map("﷐'line",159))),cljs.core.hash_map("﷐'line",159))),cljs.core.hash_map("﷐'line",159))))));
}
}));
domina.test.add_test.call(null,"append multiple children to a single parent",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<p class='appended2'>test2-1</p><p class='appended2'>test2-2</p>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,2,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//body/p[@class='appended2']"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",2,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//body/p[@class='appended2']"),cljs.core.hash_map("﷐'line",165))),cljs.core.hash_map("﷐'line",165))),cljs.core.hash_map("﷐'line",165))),cljs.core.hash_map("﷐'line",165))))));
}
}));
domina.test.add_test.call(null,"append a single child to multiple parents",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body/div/p"),"<span>!!</span>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,3,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div/p/span"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",3,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div/p/span"),cljs.core.hash_map("﷐'line",172))),cljs.core.hash_map("﷐'line",172))),cljs.core.hash_map("﷐'line",172))),cljs.core.hash_map("﷐'line",172))))));
}
}));
domina.test.add_test.call(null,"append multiple children to multiple parents",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body/div/p"),"some <span class='foo'>more</span> text");
if(cljs.core.truth_(cljs.core._EQ_.call(null,3,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div/p/span[@class='foo']"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",3,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div/p/span[@class='foo']"),cljs.core.hash_map("﷐'line",179))),cljs.core.hash_map("﷐'line",179))),cljs.core.hash_map("﷐'line",179))),cljs.core.hash_map("﷐'line",179))))));
}
}));
domina.test.add_test.call(null,"prepend a single child to a single parent",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div>2</div><div>3</div>");
domina.prepend_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div>1</div>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,"1",domina.text.call(null,domina.xpath.xpath.call(null,"//body/div[1]")))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","1",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//body/div[1]"),cljs.core.hash_map("﷐'line",185))),cljs.core.hash_map("﷐'line",185))),cljs.core.hash_map("﷐'line",185))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"2",domina.text.call(null,domina.xpath.xpath.call(null,"//body/div[2]")))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","2",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//body/div[2]"),cljs.core.hash_map("﷐'line",186))),cljs.core.hash_map("﷐'line",186))),cljs.core.hash_map("﷐'line",186))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"3",domina.text.call(null,domina.xpath.xpath.call(null,"//body/div[3]")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","3",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//body/div[3]"),cljs.core.hash_map("﷐'line",187))),cljs.core.hash_map("﷐'line",187))),cljs.core.hash_map("﷐'line",187))))));
}
}));
domina.test.add_test.call(null,"prepend a single child to multiple parents",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div><p>2</p></div><div><p>2</p></div>");
domina.prepend_BANG_.call(null,domina.xpath.xpath.call(null,"//body/div"),"<p>1</p>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,2,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//body/div/p[text()='2']"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",2,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//body/div/p[text()='2']"),cljs.core.hash_map("﷐'line",193))),cljs.core.hash_map("﷐'line",193))),cljs.core.hash_map("﷐'line",193))),cljs.core.hash_map("﷐'line",193))))));
}
}));
domina.test.add_test.call(null,"Insert a single child to a single parent",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div class='testInserts'></div>");
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//div[@class='testInserts']"),"<p class='i1'></p>");
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//div[@class='testInserts']"),"<p class='i3'></p>");
domina.insert_BANG_.call(null,domina.xpath.xpath.call(null,"//div[@class='testInserts']"),"<p class='i2'></p>",1);
if(cljs.core.truth_(cljs.core._EQ_.call(null,3,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div[@class='testInserts']/p"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",3,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[@class='testInserts']/p"),cljs.core.hash_map("﷐'line",205))),cljs.core.hash_map("﷐'line",205))),cljs.core.hash_map("﷐'line",205))),cljs.core.hash_map("﷐'line",205))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//p[@class='i2']/preceding-sibling::*"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p[@class='i2']/preceding-sibling::*"),cljs.core.hash_map("﷐'line",206))),cljs.core.hash_map("﷐'line",206))),cljs.core.hash_map("﷐'line",206))),cljs.core.hash_map("﷐'line",206))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//p[@class='i2']/following-sibling::*"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p[@class='i2']/following-sibling::*"),cljs.core.hash_map("﷐'line",207))),cljs.core.hash_map("﷐'line",207))),cljs.core.hash_map("﷐'line",207))),cljs.core.hash_map("﷐'line",207))))));
}
}));
domina.test.add_test.call(null,"Insert a single child to multiple parents",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div class='testInserts' id='testInsert1'></div>");
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div class='testInserts' id='testInsert2'></div>");
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//div[@class='testInserts']"),"<p class='i1'></p>");
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//div[@class='testInserts']"),"<p class='i3'></p>");
domina.insert_BANG_.call(null,domina.xpath.xpath.call(null,"//div[@class='testInserts']"),"<p class='i2'></p>",1);
var G__6757__6759 = cljs.core.seq.call(null,cljs.core.Vector.fromArray([domina.xpath.xpath.call(null,"//div[@id='testInsert1']"),domina.xpath.xpath.call(null,"//div[@id='testInsert2']")]));

if(cljs.core.truth_(G__6757__6759))
{var children__6760 = cljs.core.first.call(null,G__6757__6759);
var G__6757__6761 = G__6757__6759;

while(true){
if(cljs.core.truth_(cljs.core._EQ_.call(null,3,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,children__6760,"p"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",3,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","﷑'children","p"),cljs.core.hash_map("﷐'line",223))),cljs.core.hash_map("﷐'line",223))),cljs.core.hash_map("﷐'line",223))),cljs.core.hash_map("﷐'line",223))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,children__6760,"p[@class='i2']/preceding-sibling::*"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","﷑'children","p[@class='i2']/preceding-sibling::*"),cljs.core.hash_map("﷐'line",224))),cljs.core.hash_map("﷐'line",224))),cljs.core.hash_map("﷐'line",224))),cljs.core.hash_map("﷐'line",224))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,children__6760,"p[@class='i2']/following-sibling::*"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","﷑'children","p[@class='i2']/following-sibling::*"),cljs.core.hash_map("﷐'line",226))),cljs.core.hash_map("﷐'line",226))),cljs.core.hash_map("﷐'line",226))),cljs.core.hash_map("﷐'line",226))))));
}
var temp__3698__auto____6766 = cljs.core.next.call(null,G__6757__6761);

if(cljs.core.truth_(temp__3698__auto____6766))
{var G__6757__6767 = temp__3698__auto____6766;

{
var G__6775 = cljs.core.first.call(null,G__6757__6767);
var G__6776 = G__6757__6767;
children__6760 = G__6775;
G__6757__6761 = G__6776;
continue;
}
} else
{return null;
}
break;
}
} else
{return null;
}
}));
domina.test.add_test.call(null,"destroy a single node",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<p class='appended1'>app1</p>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//body/p[@class='appended1']"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//body/p[@class='appended1']"),cljs.core.hash_map("﷐'line",232))),cljs.core.hash_map("﷐'line",232))),cljs.core.hash_map("﷐'line",232))),cljs.core.hash_map("﷐'line",232))))));
}
domina.destroy_BANG_.call(null,domina.xpath.xpath.call(null,"//body/p[@class='appended1']"));
if(cljs.core.truth_(cljs.core._EQ_.call(null,0,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//body/p[@class='appended1']"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",0,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//body/p[@class='appended1']"),cljs.core.hash_map("﷐'line",234))),cljs.core.hash_map("﷐'line",234))),cljs.core.hash_map("﷐'line",234))),cljs.core.hash_map("﷐'line",234))))));
}
}));
domina.test.add_test.call(null,"destroy multiple nodes",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<p class='appended2'>app1</p><p class='appended2'>app2</p>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,2,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//body/p[@class='appended2']"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",2,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//body/p[@class='appended2']"),cljs.core.hash_map("﷐'line",240))),cljs.core.hash_map("﷐'line",240))),cljs.core.hash_map("﷐'line",240))),cljs.core.hash_map("﷐'line",240))))));
}
domina.destroy_BANG_.call(null,domina.xpath.xpath.call(null,"//body/p[@class='appended2']"));
if(cljs.core.truth_(cljs.core._EQ_.call(null,0,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//body/p[@class='appended2']"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",0,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//body/p[@class='appended2']"),cljs.core.hash_map("﷐'line",242))),cljs.core.hash_map("﷐'line",242))),cljs.core.hash_map("﷐'line",242))),cljs.core.hash_map("﷐'line",242))))));
}
}));
domina.test.add_test.call(null,"detach and reattach a single node",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
var n__6806 = domina.detach_BANG_.call(null,domina.xpath.xpath.call(null,"//p[@class='p3']"));

if(cljs.core.truth_(cljs.core._EQ_.call(null,0,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//p[@class='p3']"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",0,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p[@class='p3']"),cljs.core.hash_map("﷐'line",248))),cljs.core.hash_map("﷐'line",248))),cljs.core.hash_map("﷐'line",248))),cljs.core.hash_map("﷐'line",248))))));
}
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//div[@class='d1']"),n__6806);
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//p[@class='p3']"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p[@class='p3']"),cljs.core.hash_map("﷐'line",250))),cljs.core.hash_map("﷐'line",250))),cljs.core.hash_map("﷐'line",250))),cljs.core.hash_map("﷐'line",250))))));
}
}));
domina.test.add_test.call(null,"detach and reattach multiple nodes",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
var n__6818 = domina.detach_BANG_.call(null,domina.xpath.xpath.call(null,"//div[@class='d1']/p"));

if(cljs.core.truth_(cljs.core._EQ_.call(null,0,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div[@class='d1']/p"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",0,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[@class='d1']/p"),cljs.core.hash_map("﷐'line",256))),cljs.core.hash_map("﷐'line",256))),cljs.core.hash_map("﷐'line",256))),cljs.core.hash_map("﷐'line",256))))));
}
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//div[@class='d1']"),n__6818);
if(cljs.core.truth_(cljs.core._EQ_.call(null,3,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div[@class='d1']/p"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",3,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[@class='d1']/p"),cljs.core.hash_map("﷐'line",258))),cljs.core.hash_map("﷐'line",258))),cljs.core.hash_map("﷐'line",258))),cljs.core.hash_map("﷐'line",258))))));
}
}));
domina.test.add_test.call(null,"clear a node's contents",(function (){
domina.test.reset.call(null);
domina.test.standard_fixture.call(null);
domina.destroy_children_BANG_.call(null,domina.xpath.xpath.call(null,"//div[@class='d1']"));
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div[@class='d1']"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[@class='d1']"),cljs.core.hash_map("﷐'line",264))),cljs.core.hash_map("﷐'line",264))),cljs.core.hash_map("﷐'line",264))),cljs.core.hash_map("﷐'line",264))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,0,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div[@class='d1']/*"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",0,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[@class='d1']/*"),cljs.core.hash_map("﷐'line",265))),cljs.core.hash_map("﷐'line",265))),cljs.core.hash_map("﷐'line",265))),cljs.core.hash_map("﷐'line",265))))));
}
}));
domina.test.add_test.call(null,"insert-before! with a single reference and single new node",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div id='ref'>Some content</div>");
domina.insert_before_BANG_.call(null,domina.nodes.call(null,domina.by_id.call(null,"ref")),"<p>before</p>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div[@id='ref']/preceding-sibling::*[text()='before']"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[@id='ref']/preceding-sibling::*[text()='before']"),cljs.core.hash_map("﷐'line",271))),cljs.core.hash_map("﷐'line",271))),cljs.core.hash_map("﷐'line",271))),cljs.core.hash_map("﷐'line",271))))));
}
}));
domina.test.add_test.call(null,"insert-before! with a single reference and multiple new nodes",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div id='ref'>Some content</div>");
domina.insert_before_BANG_.call(null,domina.nodes.call(null,domina.by_id.call(null,"ref")),"<p>before1</p><p>before2</p>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div[@id='ref']/preceding-sibling::*[text()='before2' and position()=1]"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[@id='ref']/preceding-sibling::*[text()='before2' and position()=1]"),cljs.core.hash_map("﷐'line",277))),cljs.core.hash_map("﷐'line",277))),cljs.core.hash_map("﷐'line",277))),cljs.core.hash_map("﷐'line",277))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div[@id='ref']/preceding-sibling::*[text()='before1' and position()=2]"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[@id='ref']/preceding-sibling::*[text()='before1' and position()=2]"),cljs.core.hash_map("﷐'line",278))),cljs.core.hash_map("﷐'line",278))),cljs.core.hash_map("﷐'line",278))),cljs.core.hash_map("﷐'line",278))))));
}
}));
domina.test.add_test.call(null,"insert-before! with multiple reference nodes and a single new node",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div class='ref' id='ref1'>content1</div>");
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div class='ref' id='ref2'>content2</div>");
domina.insert_before_BANG_.call(null,domina.nodes.call(null,domina.by_class.call(null,"ref")),"<p>before</p>");
var t1__6890 = domina.by_class.call(null,"ref");
var t2__6891 = domina.nodes.call(null,domina.by_class.call(null,"ref"));
var t3__6892 = domina.nodes.call(null,domina.nodes.call(null,domina.by_class.call(null,"ref")));
var c1__6893 = cljs.core.count.call(null,t1__6890);
var c2__6894 = cljs.core.count.call(null,t2__6891);
var c3__6895 = cljs.core.count.call(null,t3__6892);

throw "fail hard";
if(cljs.core.truth_(cljs.core._EQ_.call(null,2,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//p"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",2,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p"),cljs.core.hash_map("﷐'line",293))),cljs.core.hash_map("﷐'line",293))),cljs.core.hash_map("﷐'line",293))),cljs.core.hash_map("﷐'line",293))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div[@id='ref1']/preceding-sibling::p"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[@id='ref1']/preceding-sibling::p"),cljs.core.hash_map("﷐'line",294))),cljs.core.hash_map("﷐'line",294))),cljs.core.hash_map("﷐'line",294))),cljs.core.hash_map("﷐'line",294))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,2,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div[@id='ref2']/preceding-sibling::p"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",2,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[@id='ref2']/preceding-sibling::p"),cljs.core.hash_map("﷐'line",295))),cljs.core.hash_map("﷐'line",295))),cljs.core.hash_map("﷐'line",295))),cljs.core.hash_map("﷐'line",295))))));
}
}));
domina.test.add_test.call(null,"insert-after! with a single reference and single new node",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div id='ref'>Some content</div>");
domina.insert_after_BANG_.call(null,domina.nodes.call(null,domina.by_id.call(null,"ref")),"<p>after</p>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div[@id='ref']/following-sibling::*[text()='after']"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[@id='ref']/following-sibling::*[text()='after']"),cljs.core.hash_map("﷐'line",302))),cljs.core.hash_map("﷐'line",302))),cljs.core.hash_map("﷐'line",302))),cljs.core.hash_map("﷐'line",302))))));
}
}));
domina.test.add_test.call(null,"insert-after! with a single reference and multiple new nodes",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div id='ref'>Some content</div>");
domina.insert_after_BANG_.call(null,domina.nodes.call(null,domina.by_id.call(null,"ref")),"<p>after1</p><p>after2</p>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div[@id='ref']/following-sibling::*[text()='after1' and position()=1]"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[@id='ref']/following-sibling::*[text()='after1' and position()=1]"),cljs.core.hash_map("﷐'line",308))),cljs.core.hash_map("﷐'line",308))),cljs.core.hash_map("﷐'line",308))),cljs.core.hash_map("﷐'line",308))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div[@id='ref']/following-sibling::*[text()='after2' and position()=2]"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[@id='ref']/following-sibling::*[text()='after2' and position()=2]"),cljs.core.hash_map("﷐'line",309))),cljs.core.hash_map("﷐'line",309))),cljs.core.hash_map("﷐'line",309))),cljs.core.hash_map("﷐'line",309))))));
}
}));
domina.test.add_test.call(null,"insert-after! with multiple reference nodes and a single new node",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div class='ref' id='ref1'>content1</div>");
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div class='ref' id='ref2'>content2</div>");
domina.insert_after_BANG_.call(null,domina.nodes.call(null,domina.by_class.call(null,"ref")),"<p>after</p>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,2,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//p"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",2,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p"),cljs.core.hash_map("﷐'line",316))),cljs.core.hash_map("﷐'line",316))),cljs.core.hash_map("﷐'line",316))),cljs.core.hash_map("﷐'line",316))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,2,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div[@id='ref1']/following-sibling::p"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",2,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[@id='ref1']/following-sibling::p"),cljs.core.hash_map("﷐'line",317))),cljs.core.hash_map("﷐'line",317))),cljs.core.hash_map("﷐'line",317))),cljs.core.hash_map("﷐'line",317))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//div[@id='ref2']/following-sibling::p"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[@id='ref2']/following-sibling::p"),cljs.core.hash_map("﷐'line",318))),cljs.core.hash_map("﷐'line",318))),cljs.core.hash_map("﷐'line",318))),cljs.core.hash_map("﷐'line",318))))));
}
}));
domina.test.add_test.call(null,"swap-content! with a single reference node and a single new node",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div><p id='before'>TYPO</p></div>");
domina.swap_content_BANG_.call(null,domina.xpath.xpath.call(null,"//p[@id='before']"),"<p id='after'>fixed</p>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,0,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//p[@id='before']"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",0,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p[@id='before']"),cljs.core.hash_map("﷐'line",324))),cljs.core.hash_map("﷐'line",324))),cljs.core.hash_map("﷐'line",324))),cljs.core.hash_map("﷐'line",324))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//p[@id='after']"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p[@id='after']"),cljs.core.hash_map("﷐'line",325))),cljs.core.hash_map("﷐'line",325))),cljs.core.hash_map("﷐'line",325))),cljs.core.hash_map("﷐'line",325))))));
}
}));
domina.test.add_test.call(null,"swap-content! with a single reference node and multiple new nodes",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div><p id='before'>TYPO</p></div>");
domina.swap_content_BANG_.call(null,domina.xpath.xpath.call(null,"//p[@id='before']"),"<p class='after'>fixed1</p><p class='after'>fixed2</p>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,0,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//p[@id='before']"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",0,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p[@id='before']"),cljs.core.hash_map("﷐'line",331))),cljs.core.hash_map("﷐'line",331))),cljs.core.hash_map("﷐'line",331))),cljs.core.hash_map("﷐'line",331))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,2,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//p[@class='after']"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",2,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p[@class='after']"),cljs.core.hash_map("﷐'line",332))),cljs.core.hash_map("﷐'line",332))),cljs.core.hash_map("﷐'line",332))),cljs.core.hash_map("﷐'line",332))))));
}
}));
domina.test.add_test.call(null,"swap-content! with multiple reference nodes and multiple new nodes",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div><p class='before'>TYPO-1</p></div>");
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div><p class='before'>TYPO-2</p></div>");
domina.swap_content_BANG_.call(null,domina.xpath.xpath.call(null,"//p[@class='before']"),"<p class='after'>fixed1</p><p class='after'>fixed2</p>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,0,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//p[@class='before']"))))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",0,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p[@class='before']"),cljs.core.hash_map("﷐'line",339))),cljs.core.hash_map("﷐'line",339))),cljs.core.hash_map("﷐'line",339))),cljs.core.hash_map("﷐'line",339))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,4,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//p[@class='after']"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",4,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p[@class='after']"),cljs.core.hash_map("﷐'line",340))),cljs.core.hash_map("﷐'line",340))),cljs.core.hash_map("﷐'line",340))),cljs.core.hash_map("﷐'line",340))))));
}
}));
domina.test.add_test.call(null,"can retrieve a css property value",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div style=\"background-color: maroon;\">Test</div>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,"maroon",domina.style.call(null,domina.xpath.xpath.call(null,"//div"),"background-color"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","maroon",cljs.core.with_meta(cljs.core.list("﷑'style",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",347)),"background-color"),cljs.core.hash_map("﷐'line",347))),cljs.core.hash_map("﷐'line",347))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"maroon",domina.style.call(null,domina.xpath.xpath.call(null,"//div"),"﷐'background-color"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","maroon",cljs.core.with_meta(cljs.core.list("﷑'style",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",348)),"﷐'background-color"),cljs.core.hash_map("﷐'line",348))),cljs.core.hash_map("﷐'line",348))))));
}
if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null,domina.style.call(null,domina.xpath.xpath.call(null,"//div"),"﷐'no-such-style"))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'nil?",cljs.core.with_meta(cljs.core.list("﷑'style",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",349)),"﷐'no-such-style"),cljs.core.hash_map("﷐'line",349))),cljs.core.hash_map("﷐'line",349))))));
}
}));
domina.test.add_test.call(null,"can retrieve an HTML attribute value",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div height=\"42\">Content!</div>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,"42",domina.attr.call(null,domina.xpath.xpath.call(null,"//div"),"height"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","42",cljs.core.with_meta(cljs.core.list("﷑'attr",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",354)),"height"),cljs.core.hash_map("﷐'line",354))),cljs.core.hash_map("﷐'line",354))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"42",domina.attr.call(null,domina.xpath.xpath.call(null,"//div"),"﷐'height"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","42",cljs.core.with_meta(cljs.core.list("﷑'attr",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",355)),"﷐'height"),cljs.core.hash_map("﷐'line",355))),cljs.core.hash_map("﷐'line",355))))));
}
if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null,domina.attr.call(null,domina.xpath.xpath.call(null,"//div"),"﷐'no-such-attr:c"))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'nil?",cljs.core.with_meta(cljs.core.list("﷑'attr",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",356)),"﷐'no-such-attr:c"),cljs.core.hash_map("﷐'line",356))),cljs.core.hash_map("﷐'line",356))))));
}
}));
domina.test.add_test.call(null,"can set a css property on a single node",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div>1</div><div>2</div>");
domina.set_style_BANG_.call(null,domina.xpath.xpath.call(null,"//div[1]"),"background-color","red");
domina.set_style_BANG_.call(null,domina.xpath.xpath.call(null,"//div[2]"),"﷐'background-color","green");
if(cljs.core.truth_(cljs.core._EQ_.call(null,"red",domina.style.call(null,domina.xpath.xpath.call(null,"//div[1]"),"background-color"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","red",cljs.core.with_meta(cljs.core.list("﷑'style",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[1]"),cljs.core.hash_map("﷐'line",363)),"background-color"),cljs.core.hash_map("﷐'line",363))),cljs.core.hash_map("﷐'line",363))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"green",domina.style.call(null,domina.xpath.xpath.call(null,"//div[2]"),"background-color"))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","green",cljs.core.with_meta(cljs.core.list("﷑'style",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[2]"),cljs.core.hash_map("﷐'line",364)),"background-color"),cljs.core.hash_map("﷐'line",364))),cljs.core.hash_map("﷐'line",364))))));
}
}));
domina.test.add_test.call(null,"can set a css property on multiple nodes",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div>1</div><div>2</div>");
domina.set_style_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),"color","red");
if(cljs.core.truth_(cljs.core._EQ_.call(null,"red",domina.style.call(null,domina.xpath.xpath.call(null,"//div[1]"),"color"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","red",cljs.core.with_meta(cljs.core.list("﷑'style",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[1]"),cljs.core.hash_map("﷐'line",370)),"color"),cljs.core.hash_map("﷐'line",370))),cljs.core.hash_map("﷐'line",370))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"red",domina.style.call(null,domina.xpath.xpath.call(null,"//div[2]"),"color"))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","red",cljs.core.with_meta(cljs.core.list("﷑'style",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[2]"),cljs.core.hash_map("﷐'line",371)),"color"),cljs.core.hash_map("﷐'line",371))),cljs.core.hash_map("﷐'line",371))))));
}
}));
domina.test.add_test.call(null,"can set a html attribute on a single node",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div>1</div><div>2</div>");
domina.set_attr_BANG_.call(null,domina.xpath.xpath.call(null,"//div[1]"),"width",42);
domina.set_attr_BANG_.call(null,domina.xpath.xpath.call(null,"//div[2]"),"﷐'width",42);
if(cljs.core.truth_(cljs.core._EQ_.call(null,"42",domina.attr.call(null,domina.xpath.xpath.call(null,"//div[1]"),"width"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","42",cljs.core.with_meta(cljs.core.list("﷑'attr",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[1]"),cljs.core.hash_map("﷐'line",378)),"width"),cljs.core.hash_map("﷐'line",378))),cljs.core.hash_map("﷐'line",378))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"42",domina.attr.call(null,domina.xpath.xpath.call(null,"//div[2]"),"width"))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","42",cljs.core.with_meta(cljs.core.list("﷑'attr",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[2]"),cljs.core.hash_map("﷐'line",379)),"width"),cljs.core.hash_map("﷐'line",379))),cljs.core.hash_map("﷐'line",379))))));
}
}));
domina.test.add_test.call(null,"can set a html attribute on a single node",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div>1</div><div>2</div>");
domina.set_attr_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),"width",42);
if(cljs.core.truth_(cljs.core._EQ_.call(null,"42",domina.attr.call(null,domina.xpath.xpath.call(null,"//div[1]"),"width"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","42",cljs.core.with_meta(cljs.core.list("﷑'attr",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[1]"),cljs.core.hash_map("﷐'line",385)),"width"),cljs.core.hash_map("﷐'line",385))),cljs.core.hash_map("﷐'line",385))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"42",domina.attr.call(null,domina.xpath.xpath.call(null,"//div[2]"),"width"))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","42",cljs.core.with_meta(cljs.core.list("﷑'attr",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[2]"),cljs.core.hash_map("﷐'line",386)),"width"),cljs.core.hash_map("﷐'line",386))),cljs.core.hash_map("﷐'line",386))))));
}
}));
domina.test.add_test.call(null,"can get multiple CSS styles from a single node.",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div>1</div>");
domina.set_style_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),"color","red");
domina.set_style_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),"background-color","black");
if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.ObjMap.fromObject(["﷐'color","﷐'background-color"],{"﷐'color":"red","﷐'background-color":"black"}),domina.styles.call(null,domina.xpath.xpath.call(null,"//div")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",cljs.core.hash_map("﷐'color","red","﷐'background-color","black"),cljs.core.with_meta(cljs.core.list("﷑'styles",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",394))),cljs.core.hash_map("﷐'line",394))),cljs.core.hash_map("﷐'line",393))))));
}
}));
domina.test.add_test.call(null,"can get multiple HTML attributes from a single node.",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div>1</div>");
domina.set_attr_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),"width",42);
domina.set_attr_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),"height",24);
if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.ObjMap.fromObject(["﷐'width","﷐'height"],{"﷐'width":"42","﷐'height":"24"}),domina.attrs.call(null,domina.xpath.xpath.call(null,"//div")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",cljs.core.hash_map("﷐'width","42","﷐'height","24"),cljs.core.with_meta(cljs.core.list("﷑'attrs",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",402))),cljs.core.hash_map("﷐'line",402))),cljs.core.hash_map("﷐'line",401))))));
}
}));
domina.test.add_test.call(null,"can set multiple CSS styles on a single node",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div>1</div>");
domina.set_styles_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),cljs.core.ObjMap.fromObject(["﷐'color","﷐'background-color"],{"﷐'color":"red","﷐'background-color":"black"}));
if(cljs.core.truth_(cljs.core._EQ_.call(null,"black",domina.style.call(null,domina.xpath.xpath.call(null,"//div"),"background-color"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","black",cljs.core.with_meta(cljs.core.list("﷑'style",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",409)),"background-color"),cljs.core.hash_map("﷐'line",409))),cljs.core.hash_map("﷐'line",409))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"red",domina.style.call(null,domina.xpath.xpath.call(null,"//div"),"color"))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","red",cljs.core.with_meta(cljs.core.list("﷑'style",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",410)),"color"),cljs.core.hash_map("﷐'line",410))),cljs.core.hash_map("﷐'line",410))))));
}
}));
domina.test.add_test.call(null,"can set multiple CSS styles on multiple nodes",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div>1</div><div>2</div>");
domina.set_styles_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),cljs.core.ObjMap.fromObject(["﷐'color","﷐'background-color"],{"﷐'color":"red","﷐'background-color":"black"}));
if(cljs.core.truth_(cljs.core._EQ_.call(null,"black",domina.style.call(null,domina.xpath.xpath.call(null,"//div[1]"),"background-color"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","black",cljs.core.with_meta(cljs.core.list("﷑'style",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[1]"),cljs.core.hash_map("﷐'line",417)),"background-color"),cljs.core.hash_map("﷐'line",417))),cljs.core.hash_map("﷐'line",417))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"red",domina.style.call(null,domina.xpath.xpath.call(null,"//div[1]"),"color"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","red",cljs.core.with_meta(cljs.core.list("﷑'style",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[1]"),cljs.core.hash_map("﷐'line",418)),"color"),cljs.core.hash_map("﷐'line",418))),cljs.core.hash_map("﷐'line",418))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"black",domina.style.call(null,domina.xpath.xpath.call(null,"//div[2]"),"background-color"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","black",cljs.core.with_meta(cljs.core.list("﷑'style",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[2]"),cljs.core.hash_map("﷐'line",419)),"background-color"),cljs.core.hash_map("﷐'line",419))),cljs.core.hash_map("﷐'line",419))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"red",domina.style.call(null,domina.xpath.xpath.call(null,"//div[2]"),"color"))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","red",cljs.core.with_meta(cljs.core.list("﷑'style",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[2]"),cljs.core.hash_map("﷐'line",420)),"color"),cljs.core.hash_map("﷐'line",420))),cljs.core.hash_map("﷐'line",420))))));
}
}));
domina.test.add_test.call(null,"can set multiple HTML attributes on a single node",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div>1</div>");
domina.set_attrs_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),cljs.core.ObjMap.fromObject(["﷐'width","﷐'height"],{"﷐'width":42,"﷐'height":24}));
if(cljs.core.truth_(cljs.core._EQ_.call(null,"42",domina.attr.call(null,domina.xpath.xpath.call(null,"//div"),"width"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","42",cljs.core.with_meta(cljs.core.list("﷑'attr",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",427)),"width"),cljs.core.hash_map("﷐'line",427))),cljs.core.hash_map("﷐'line",427))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"24",domina.attr.call(null,domina.xpath.xpath.call(null,"//div"),"height"))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","24",cljs.core.with_meta(cljs.core.list("﷑'attr",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",428)),"height"),cljs.core.hash_map("﷐'line",428))),cljs.core.hash_map("﷐'line",428))))));
}
}));
domina.test.add_test.call(null,"can set multiple CSS styles on multiple nodes",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div>1</div><div>2</div>");
domina.set_attrs_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),cljs.core.ObjMap.fromObject(["﷐'width","﷐'height"],{"﷐'width":42,"﷐'height":24}));
if(cljs.core.truth_(cljs.core._EQ_.call(null,"42",domina.attr.call(null,domina.xpath.xpath.call(null,"//div[1]"),"width"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","42",cljs.core.with_meta(cljs.core.list("﷑'attr",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[1]"),cljs.core.hash_map("﷐'line",435)),"width"),cljs.core.hash_map("﷐'line",435))),cljs.core.hash_map("﷐'line",435))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"24",domina.attr.call(null,domina.xpath.xpath.call(null,"//div[1]"),"height"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","24",cljs.core.with_meta(cljs.core.list("﷑'attr",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[1]"),cljs.core.hash_map("﷐'line",436)),"height"),cljs.core.hash_map("﷐'line",436))),cljs.core.hash_map("﷐'line",436))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"42",domina.attr.call(null,domina.xpath.xpath.call(null,"//div[2]"),"width"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","42",cljs.core.with_meta(cljs.core.list("﷑'attr",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[2]"),cljs.core.hash_map("﷐'line",437)),"width"),cljs.core.hash_map("﷐'line",437))),cljs.core.hash_map("﷐'line",437))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"24",domina.attr.call(null,domina.xpath.xpath.call(null,"//div[2]"),"height"))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","24",cljs.core.with_meta(cljs.core.list("﷑'attr",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[2]"),cljs.core.hash_map("﷐'line",438)),"height"),cljs.core.hash_map("﷐'line",438))),cljs.core.hash_map("﷐'line",438))))));
}
}));
domina.test.add_test.call(null,"test the has-class? function",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div class='class1'>1</div>");
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div class='class2'>2</div>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,true,domina.has_class_QMARK_.call(null,domina.xpath.xpath.call(null,"//div[1]"),"class1"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",true,cljs.core.with_meta(cljs.core.list("﷑'has-class?",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[1]"),cljs.core.hash_map("﷐'line",444)),"class1"),cljs.core.hash_map("﷐'line",444))),cljs.core.hash_map("﷐'line",444))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,true,domina.has_class_QMARK_.call(null,domina.xpath.xpath.call(null,"//div[2]"),"class2"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",true,cljs.core.with_meta(cljs.core.list("﷑'has-class?",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[2]"),cljs.core.hash_map("﷐'line",445)),"class2"),cljs.core.hash_map("﷐'line",445))),cljs.core.hash_map("﷐'line",445))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,false,domina.has_class_QMARK_.call(null,domina.xpath.xpath.call(null,"//div[1]"),"class2"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",false,cljs.core.with_meta(cljs.core.list("﷑'has-class?",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[1]"),cljs.core.hash_map("﷐'line",446)),"class2"),cljs.core.hash_map("﷐'line",446))),cljs.core.hash_map("﷐'line",446))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,false,domina.has_class_QMARK_.call(null,domina.xpath.xpath.call(null,"//div[2]"),"class1"))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",false,cljs.core.with_meta(cljs.core.list("﷑'has-class?",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[2]"),cljs.core.hash_map("﷐'line",447)),"class1"),cljs.core.hash_map("﷐'line",447))),cljs.core.hash_map("﷐'line",447))))));
}
}));
domina.test.add_test.call(null,"can add a CSS class to a single node",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div>1</div>");
domina.add_class_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),"class1");
domina.add_class_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),"class2");
if(cljs.core.truth_(cljs.core._EQ_.call(null,true,domina.has_class_QMARK_.call(null,domina.xpath.xpath.call(null,"//div"),"class1"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",true,cljs.core.with_meta(cljs.core.list("﷑'has-class?",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",454)),"class1"),cljs.core.hash_map("﷐'line",454))),cljs.core.hash_map("﷐'line",454))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,true,domina.has_class_QMARK_.call(null,domina.xpath.xpath.call(null,"//div"),"class2"))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",true,cljs.core.with_meta(cljs.core.list("﷑'has-class?",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",455)),"class2"),cljs.core.hash_map("﷐'line",455))),cljs.core.hash_map("﷐'line",455))))));
}
}));
domina.test.add_test.call(null,"can add a CSS class to multiple nodes",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div>1</div><div>2</div>");
domina.add_class_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),"class1");
domina.add_class_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),"class2");
if(cljs.core.truth_(cljs.core._EQ_.call(null,true,domina.has_class_QMARK_.call(null,domina.xpath.xpath.call(null,"//div[1]"),"class1"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",true,cljs.core.with_meta(cljs.core.list("﷑'has-class?",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[1]"),cljs.core.hash_map("﷐'line",462)),"class1"),cljs.core.hash_map("﷐'line",462))),cljs.core.hash_map("﷐'line",462))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,true,domina.has_class_QMARK_.call(null,domina.xpath.xpath.call(null,"//div[2]"),"class1"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",true,cljs.core.with_meta(cljs.core.list("﷑'has-class?",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[2]"),cljs.core.hash_map("﷐'line",463)),"class1"),cljs.core.hash_map("﷐'line",463))),cljs.core.hash_map("﷐'line",463))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,true,domina.has_class_QMARK_.call(null,domina.xpath.xpath.call(null,"//div[1]"),"class2"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",true,cljs.core.with_meta(cljs.core.list("﷑'has-class?",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[1]"),cljs.core.hash_map("﷐'line",464)),"class2"),cljs.core.hash_map("﷐'line",464))),cljs.core.hash_map("﷐'line",464))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,true,domina.has_class_QMARK_.call(null,domina.xpath.xpath.call(null,"//div[2]"),"class2"))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",true,cljs.core.with_meta(cljs.core.list("﷑'has-class?",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[2]"),cljs.core.hash_map("﷐'line",465)),"class2"),cljs.core.hash_map("﷐'line",465))),cljs.core.hash_map("﷐'line",465))))));
}
}));
domina.test.add_test.call(null,"can remove a CSS class from a single node",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div class='class1 class2'>1</div>");
domina.remove_class_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),"class1");
if(cljs.core.truth_(cljs.core._EQ_.call(null,false,domina.has_class_QMARK_.call(null,domina.xpath.xpath.call(null,"//div"),"class1"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",false,cljs.core.with_meta(cljs.core.list("﷑'has-class?",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",471)),"class1"),cljs.core.hash_map("﷐'line",471))),cljs.core.hash_map("﷐'line",471))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,true,domina.has_class_QMARK_.call(null,domina.xpath.xpath.call(null,"//div"),"class2"))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",true,cljs.core.with_meta(cljs.core.list("﷑'has-class?",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",472)),"class2"),cljs.core.hash_map("﷐'line",472))),cljs.core.hash_map("﷐'line",472))))));
}
}));
domina.test.add_test.call(null,"can remove a CSS class from a multiple nodes",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div class='class1 class2'>1</div><div class='class1 class2'>2</div>");
domina.remove_class_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),"class1");
if(cljs.core.truth_(cljs.core._EQ_.call(null,false,domina.has_class_QMARK_.call(null,domina.xpath.xpath.call(null,"//div[1]"),"class1"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",false,cljs.core.with_meta(cljs.core.list("﷑'has-class?",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[1]"),cljs.core.hash_map("﷐'line",478)),"class1"),cljs.core.hash_map("﷐'line",478))),cljs.core.hash_map("﷐'line",478))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,true,domina.has_class_QMARK_.call(null,domina.xpath.xpath.call(null,"//div[1]"),"class2"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",true,cljs.core.with_meta(cljs.core.list("﷑'has-class?",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[1]"),cljs.core.hash_map("﷐'line",479)),"class2"),cljs.core.hash_map("﷐'line",479))),cljs.core.hash_map("﷐'line",479))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,false,domina.has_class_QMARK_.call(null,domina.xpath.xpath.call(null,"//div[2]"),"class1"))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",false,cljs.core.with_meta(cljs.core.list("﷑'has-class?",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[2]"),cljs.core.hash_map("﷐'line",480)),"class1"),cljs.core.hash_map("﷐'line",480))),cljs.core.hash_map("﷐'line",480))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,true,domina.has_class_QMARK_.call(null,domina.xpath.xpath.call(null,"//div[2]"),"class2"))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",true,cljs.core.with_meta(cljs.core.list("﷑'has-class?",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div[2]"),cljs.core.hash_map("﷐'line",481)),"class2"),cljs.core.hash_map("﷐'line",481))),cljs.core.hash_map("﷐'line",481))))));
}
}));
domina.test.add_test.call(null,"can get a list of all css classes for a node",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div class='class1 class2 class3'>1</div>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.Vector.fromArray(["class1","class2","class3"]),domina.classes.call(null,domina.xpath.xpath.call(null,"//div")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",(new cljs.core.Vector(null, ["class1","class2","class3"])),cljs.core.with_meta(cljs.core.list("﷑'classes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",486))),cljs.core.hash_map("﷐'line",486))),cljs.core.hash_map("﷐'line",486))))));
}
}));
domina.test.add_test.call(null,"can retrieve the text value of a node with normalization.",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<p>\n\n   Some text.  \n  </p>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Some text.",domina.text.call(null,domina.xpath.xpath.call(null,"//p")))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Some text.",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p"),cljs.core.hash_map("﷐'line",491))),cljs.core.hash_map("﷐'line",491))),cljs.core.hash_map("﷐'line",491))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Some text.",domina.text.call(null,domina.xpath.xpath.call(null,"//p"),true))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Some text.",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p"),cljs.core.hash_map("﷐'line",492)),true),cljs.core.hash_map("﷐'line",492))),cljs.core.hash_map("﷐'line",492))))));
}
}));
domina.test.add_test.call(null,"can set text on a single node",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<p></p>");
domina.set_text_BANG_.call(null,domina.xpath.xpath.call(null,"//p"),"Hello world!");
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Hello world!",domina.text.call(null,domina.xpath.xpath.call(null,"//p")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Hello world!",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p"),cljs.core.hash_map("﷐'line",505))),cljs.core.hash_map("﷐'line",505))),cljs.core.hash_map("﷐'line",505))))));
}
}));
domina.test.add_test.call(null,"can set text on a multiple nodes",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<p></p><p></p>");
domina.set_text_BANG_.call(null,domina.xpath.xpath.call(null,"//p"),"Hello world!");
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Hello world!",domina.text.call(null,domina.xpath.xpath.call(null,"//p[1]")))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Hello world!",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p[1]"),cljs.core.hash_map("﷐'line",511))),cljs.core.hash_map("﷐'line",511))),cljs.core.hash_map("﷐'line",511))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Hello world!",domina.text.call(null,domina.xpath.xpath.call(null,"//p[2]")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Hello world!",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p[2]"),cljs.core.hash_map("﷐'line",512))),cljs.core.hash_map("﷐'line",512))),cljs.core.hash_map("﷐'line",512))))));
}
}));
domina.test.add_test.call(null,"can get a form field value",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<form><input type='text' name='test' value='Test Value'></input></form>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Test Value",domina.value.call(null,domina.xpath.xpath.call(null,"//input")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Test Value",cljs.core.with_meta(cljs.core.list("﷑'value",cljs.core.with_meta(cljs.core.list("﷑'xpath","//input"),cljs.core.hash_map("﷐'line",517))),cljs.core.hash_map("﷐'line",517))),cljs.core.hash_map("﷐'line",517))))));
}
}));
domina.test.add_test.call(null,"can set a form field value",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<form><input type='text' name='test'></input></form>");
domina.set_value_BANG_.call(null,domina.xpath.xpath.call(null,"//input"),"Test Value");
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Test Value",domina.value.call(null,domina.xpath.xpath.call(null,"//input")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Test Value",cljs.core.with_meta(cljs.core.list("﷑'value",cljs.core.with_meta(cljs.core.list("﷑'xpath","//input"),cljs.core.hash_map("﷐'line",523))),cljs.core.hash_map("﷐'line",523))),cljs.core.hash_map("﷐'line",523))))));
}
}));
domina.test.add_test.call(null,"can set multiple form field values",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<form><input type='text' name='test'></input><input type='text' name='test'></input></form>");
domina.set_value_BANG_.call(null,domina.xpath.xpath.call(null,"//input"),"Test Value");
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Test Value",domina.value.call(null,domina.xpath.xpath.call(null,"//input[1]")))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Test Value",cljs.core.with_meta(cljs.core.list("﷑'value",cljs.core.with_meta(cljs.core.list("﷑'xpath","//input[1]"),cljs.core.hash_map("﷐'line",529))),cljs.core.hash_map("﷐'line",529))),cljs.core.hash_map("﷐'line",529))))));
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Test Value",domina.value.call(null,domina.xpath.xpath.call(null,"//input[2]")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Test Value",cljs.core.with_meta(cljs.core.list("﷑'value",cljs.core.with_meta(cljs.core.list("﷑'xpath","//input[2]"),cljs.core.hash_map("﷐'line",530))),cljs.core.hash_map("﷐'line",530))),cljs.core.hash_map("﷐'line",530))))));
}
}));
domina.test.add_test.call(null,"can get a node's innerHTML",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div><p class='foobar'>some text</p></div>");
if(cljs.core.truth_((function (){var or__3548__auto____7008 = cljs.core._EQ_.call(null,"<p class=\"foobar\">some text</p>",domina.html.call(null,domina.xpath.xpath.call(null,"//div")));

if(cljs.core.truth_(or__3548__auto____7008))
{return or__3548__auto____7008;
} else
{return cljs.core._EQ_.call(null,"<P class=foobar>some text</P>",domina.html.call(null,domina.xpath.xpath.call(null,"//div")));
}
})()))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'or",cljs.core.with_meta(cljs.core.list("﷑'=","<p class=\"foobar\">some text</p>",cljs.core.with_meta(cljs.core.list("﷑'html",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",536))),cljs.core.hash_map("﷐'line",536))),cljs.core.hash_map("﷐'line",536)),cljs.core.with_meta(cljs.core.list("﷑'=","<P class=foobar>some text</P>",cljs.core.with_meta(cljs.core.list("﷑'html",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",537))),cljs.core.hash_map("﷐'line",537))),cljs.core.hash_map("﷐'line",537))),cljs.core.hash_map("﷐'line",536))))));
}
}));
domina.test.add_test.call(null,"can set a node's innerHTML",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div></div>");
domina.set_html_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),"<p class='foobar'>some text</p>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,1,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//body/div/p[@class='foobar']"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",1,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//body/div/p[@class='foobar']"),cljs.core.hash_map("﷐'line",543))),cljs.core.hash_map("﷐'line",543))),cljs.core.hash_map("﷐'line",543))),cljs.core.hash_map("﷐'line",543))))));
}
}));
domina.test.add_test.call(null,"can set multiple nodes' innerHTML",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div></div><div></div>");
domina.set_html_BANG_.call(null,domina.xpath.xpath.call(null,"//div"),"<p class='foobar'>some text</p>");
if(cljs.core.truth_(cljs.core._EQ_.call(null,2,cljs.core.count.call(null,domina.nodes.call(null,domina.xpath.xpath.call(null,"//body/div/p[@class='foobar']"))))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",2,cljs.core.with_meta(cljs.core.list("﷑'count",cljs.core.with_meta(cljs.core.list("﷑'nodes",cljs.core.with_meta(cljs.core.list("﷑'xpath","//body/div/p[@class='foobar']"),cljs.core.hash_map("﷐'line",549))),cljs.core.hash_map("﷐'line",549))),cljs.core.hash_map("﷐'line",549))),cljs.core.hash_map("﷐'line",549))))));
}
}));
domina.test.add_test.call(null,"can get nodes from strings containing cell-level table fragments",(function (){
domina.test.reset.call(null);
var n__7036 = domina.nodes.call(null,"<td>Cell</td><th>Header</th>");

if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.count.call(null,n__7036),2)))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",cljs.core.with_meta(cljs.core.list("﷑'count","﷑'n"),cljs.core.hash_map("﷐'line",554)),2),cljs.core.hash_map("﷐'line",554))))));
}
var G__7037__7038 = cljs.core.seq.call(null,n__7036);

if(cljs.core.truth_(G__7037__7038))
{var h__7039 = cljs.core.first.call(null,G__7037__7038);
var G__7037__7040 = G__7037__7038;

while(true){
if(cljs.core.truth_(cljs.core.re_find.call(null,/TableCell/,cljs.core.pr_str.call(null,h__7039))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'re-find",/TableCell/,cljs.core.with_meta(cljs.core.list("﷑'pr-str","﷑'h"),cljs.core.hash_map("﷐'line",556))),cljs.core.hash_map("﷐'line",556))))));
}
var temp__3698__auto____7041 = cljs.core.next.call(null,G__7037__7040);

if(cljs.core.truth_(temp__3698__auto____7041))
{var G__7037__7044 = temp__3698__auto____7041;

{
var G__7052 = cljs.core.first.call(null,G__7037__7044);
var G__7053 = G__7037__7044;
h__7039 = G__7052;
G__7037__7040 = G__7053;
continue;
}
} else
{return null;
}
break;
}
} else
{return null;
}
}));
domina.test.add_test.call(null,"can get nodes from strings containing row-level table fragments",(function (){
domina.test.reset.call(null);
var n__7054 = domina.nodes.call(null,"<tr><td>Cell</td><th>Header</th></tr><tr><td>Another</td><th>Row</th></tr>");

if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.count.call(null,n__7054),2)))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",cljs.core.with_meta(cljs.core.list("﷑'count","﷑'n"),cljs.core.hash_map("﷐'line",561)),2),cljs.core.hash_map("﷐'line",561))))));
}
var G__7056__7057 = cljs.core.seq.call(null,n__7054);

if(cljs.core.truth_(G__7056__7057))
{var h__7058 = cljs.core.first.call(null,G__7056__7057);
var G__7056__7059 = G__7056__7057;

while(true){
if(cljs.core.truth_(cljs.core.re_find.call(null,/TableRow/,cljs.core.pr_str.call(null,h__7058))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'re-find",/TableRow/,cljs.core.with_meta(cljs.core.list("﷑'pr-str","﷑'h"),cljs.core.hash_map("﷐'line",563))),cljs.core.hash_map("﷐'line",563))))));
}
var temp__3698__auto____7060 = cljs.core.next.call(null,G__7056__7059);

if(cljs.core.truth_(temp__3698__auto____7060))
{var G__7056__7061 = temp__3698__auto____7060;

{
var G__7081 = cljs.core.first.call(null,G__7056__7061);
var G__7082 = G__7056__7061;
h__7058 = G__7081;
G__7056__7059 = G__7082;
continue;
}
} else
{return null;
}
break;
}
} else
{return null;
}
}));
domina.test.add_test.call(null,"can get nodes from strings containing section-level table fragments",(function (){
domina.test.reset.call(null);
var n__7083 = domina.nodes.call(null,"<thead><tr><td>Cell</td><th>Header</th></tr></thead><tbody><tr><td>Another</td><th>Row</th></tr></tbody>");

if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.count.call(null,n__7083),2)))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=",cljs.core.with_meta(cljs.core.list("﷑'count","﷑'n"),cljs.core.hash_map("﷐'line",568)),2),cljs.core.hash_map("﷐'line",568))))));
}
var G__7084__7085 = cljs.core.seq.call(null,n__7083);

if(cljs.core.truth_(G__7084__7085))
{var h__7086 = cljs.core.first.call(null,G__7084__7085);
var G__7084__7087 = G__7084__7085;

while(true){
if(cljs.core.truth_(cljs.core.re_find.call(null,/TableSection/,cljs.core.pr_str.call(null,h__7086))))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'re-find",/TableSection/,cljs.core.with_meta(cljs.core.list("﷑'pr-str","﷑'h"),cljs.core.hash_map("﷐'line",570))),cljs.core.hash_map("﷐'line",570))))));
}
var temp__3698__auto____7088 = cljs.core.next.call(null,G__7084__7087);

if(cljs.core.truth_(temp__3698__auto____7088))
{var G__7084__7089 = temp__3698__auto____7088;

{
var G__7099 = cljs.core.first.call(null,G__7084__7089);
var G__7100 = G__7084__7089;
h__7086 = G__7099;
G__7084__7087 = G__7100;
continue;
}
} else
{return null;
}
break;
}
} else
{return null;
}
}));
domina.test.add_test.call(null,"can trigger a handler on a :mouseover event",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div id='ref'>Some content</div>");
domina.events.listen_BANG_.call(null,domina.by_id.call(null,"ref"),"﷐'mouseover",(function (){
return domina.append_BANG_.call(null,domina.by_id.call(null,"ref"),"<p>Hello world!</p>");
}));
var target__7101 = domina.by_id.call(null,"ref");

domina.events.fire_listeners_BANG_.call(null,target__7101,"﷐'mouseover",false,cljs.core.ObjMap.fromObject(["﷐'type","﷐'target"],{"﷐'type":"﷐'mouseover","﷐'target":target__7101}));
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Hello world!",domina.text.call(null,domina.xpath.xpath.call(null,"//p")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Hello world!",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p"),cljs.core.hash_map("﷐'line",578))),cljs.core.hash_map("﷐'line",578))),cljs.core.hash_map("﷐'line",578))))));
}
}));
domina.test.add_test.call(null,"can trigger a handler on a :mouseout event",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div id='ref'>Some content</div>");
domina.events.listen_BANG_.call(null,domina.by_id.call(null,"ref"),"﷐'mouseout",(function (){
return domina.append_BANG_.call(null,domina.by_id.call(null,"ref"),"<p>Hello world!</p>");
}));
var target__7106 = domina.by_id.call(null,"ref");

domina.events.fire_listeners_BANG_.call(null,target__7106,"﷐'mouseout",false,cljs.core.ObjMap.fromObject(["﷐'type","﷐'target"],{"﷐'type":"﷐'mouseout","﷐'target":target__7106}));
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Hello world!",domina.text.call(null,domina.xpath.xpath.call(null,"//p")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Hello world!",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p"),cljs.core.hash_map("﷐'line",586))),cljs.core.hash_map("﷐'line",586))),cljs.core.hash_map("﷐'line",586))))));
}
}));
domina.test.add_test.call(null,"can trigger a handler on a :click event",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div id='ref'>Some content</div>");
domina.events.listen_BANG_.call(null,domina.by_id.call(null,"ref"),"﷐'click",(function (){
return domina.append_BANG_.call(null,domina.by_id.call(null,"ref"),"<p>Hello world!</p>");
}));
var target__7110 = domina.by_id.call(null,"ref");

domina.events.fire_listeners_BANG_.call(null,target__7110,"﷐'click",false,cljs.core.ObjMap.fromObject(["﷐'type","﷐'target"],{"﷐'type":"﷐'click","﷐'target":target__7110}));
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Hello world!",domina.text.call(null,domina.xpath.xpath.call(null,"//p")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Hello world!",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p"),cljs.core.hash_map("﷐'line",594))),cljs.core.hash_map("﷐'line",594))),cljs.core.hash_map("﷐'line",594))))));
}
}));
domina.test.add_test.call(null,"can trigger a handler on a :mouseenter event",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div id='parent'><div id='ref'></div></div>");
domina.events.listen_BANG_.call(null,domina.by_id.call(null,"ref"),"﷐'mouseenter",(function (){
return domina.append_BANG_.call(null,domina.by_id.call(null,"ref"),"<p>Hello world!</p>");
}));
var rtarget__7119 = domina.by_id.call(null,"parent");
var target__7120 = domina.by_id.call(null,"ref");

domina.events.fire_listeners_BANG_.call(null,target__7120,"﷐'mouseenter",false,cljs.core.ObjMap.fromObject(["﷐'type","﷐'related-target","﷐'target"],{"﷐'type":"﷐'mouseenter","﷐'related-target":rtarget__7119,"﷐'target":target__7120}));
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Hello world!",domina.text.call(null,domina.xpath.xpath.call(null,"//p")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Hello world!",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p"),cljs.core.hash_map("﷐'line",604))),cljs.core.hash_map("﷐'line",604))),cljs.core.hash_map("﷐'line",604))))));
}
}));
domina.test.add_test.call(null,"can trigger a handler on a :mouseleave event",(function (){
domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div id='parent'><div id='ref'></div></div>");
domina.events.listen_BANG_.call(null,domina.by_id.call(null,"ref"),"﷐'mouseleave",(function (){
return domina.append_BANG_.call(null,domina.by_id.call(null,"ref"),"<p>Hello world!</p>");
}));
var rtarget__7123 = domina.by_id.call(null,"parent");
var target__7124 = domina.by_id.call(null,"ref");

domina.events.fire_listeners_BANG_.call(null,target__7124,"﷐'mouseleave",false,cljs.core.ObjMap.fromObject(["﷐'type","﷐'related-target","﷐'target"],{"﷐'type":"﷐'mouseleave","﷐'related-target":rtarget__7123,"﷐'target":target__7124}));
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Hello world!",domina.text.call(null,domina.xpath.xpath.call(null,"//p")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Hello world!",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//p"),cljs.core.hash_map("﷐'line",614))),cljs.core.hash_map("﷐'line",614))),cljs.core.hash_map("﷐'line",614))))));
}
}));
domina.test.add_test.call(null,"can remove-listeners on a :click event",(function (){
var handler__7125 = (function (){
return domina.append_BANG_.call(null,domina.by_id.call(null,"ref"),"<p>Hello world!</p>");
});

domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div id='ref'>Some content</div>");
domina.events.listen_BANG_.call(null,domina.by_id.call(null,"ref"),"﷐'click",handler__7125);
domina.events.remove_listeners_BANG_.call(null,domina.by_id.call(null,"ref"),"﷐'click");
var target__7128 = domina.by_id.call(null,"ref");

domina.events.fire_listeners_BANG_.call(null,target__7128,"﷐'click",false,cljs.core.ObjMap.fromObject(["﷐'type","﷐'target"],{"﷐'type":"﷐'click","﷐'target":target__7128}));
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Some content",domina.text.call(null,domina.xpath.xpath.call(null,"//div")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Some content",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",624))),cljs.core.hash_map("﷐'line",624))),cljs.core.hash_map("﷐'line",624))))));
}
}));
domina.test.add_test.call(null,"can remove-listeners on a :mouseenter event",(function (){
var handler__7131 = (function (){
return domina.append_BANG_.call(null,domina.by_id.call(null,"ref"),"<p>Hello world!</p>");
});

domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div id='parent'><div id='ref'>Some content</div></div>");
domina.events.listen_BANG_.call(null,domina.by_id.call(null,"ref"),"﷐'mouseenter",handler__7131);
domina.events.remove_listeners_BANG_.call(null,domina.by_id.call(null,"ref"),"﷐'mouseenter");
var rtarget__7135 = domina.by_id.call(null,"parent");
var target__7136 = domina.by_id.call(null,"ref");

domina.events.fire_listeners_BANG_.call(null,target__7136,"﷐'mouseenter",false,cljs.core.ObjMap.fromObject(["﷐'type","﷐'related-target","﷐'target"],{"﷐'type":"﷐'mouseenter","﷐'related-target":rtarget__7135,"﷐'target":target__7136}));
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Some content",domina.text.call(null,domina.xpath.xpath.call(null,"//div")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Some content",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",635))),cljs.core.hash_map("﷐'line",635))),cljs.core.hash_map("﷐'line",635))))));
}
}));
domina.test.add_test.call(null,"can unlisten! on a :click event",(function (){
var handler__7150 = (function (){
return domina.append_BANG_.call(null,domina.by_id.call(null,"ref"),"<p>Hello world!</p>");
});

domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div id='ref'>Some content</div>");
domina.events.listen_BANG_.call(null,domina.by_id.call(null,"ref"),"﷐'click",handler__7150);
domina.events.unlisten_BANG_.call(null,domina.by_id.call(null,"ref"),"﷐'click",handler__7150);
var target__7151 = domina.by_id.call(null,"ref");

domina.events.fire_listeners_BANG_.call(null,target__7151,"﷐'click",false,cljs.core.ObjMap.fromObject(["﷐'type","﷐'target"],{"﷐'type":"﷐'click","﷐'target":target__7151}));
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Some content",domina.text.call(null,domina.xpath.xpath.call(null,"//div")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Some content",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",645))),cljs.core.hash_map("﷐'line",645))),cljs.core.hash_map("﷐'line",645))))));
}
}));
domina.test.add_test.call(null,"can unlisten! on a :mouseenter event",(function (){
var handler__7155 = (function (){
return domina.append_BANG_.call(null,domina.by_id.call(null,"ref"),"<p>Hello world!</p>");
});

domina.test.reset.call(null);
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div id='parent'><div id='ref'>Some content</div></div>");
domina.events.listen_BANG_.call(null,domina.by_id.call(null,"ref"),"﷐'mouseenter",handler__7155);
domina.events.unlisten_BANG_.call(null,domina.by_id.call(null,"ref"),"﷐'mouseenter",handler__7155);
var rtarget__7156 = domina.by_id.call(null,"parent");
var target__7157 = domina.by_id.call(null,"ref");

domina.events.fire_listeners_BANG_.call(null,target__7157,"﷐'mouseenter",false,cljs.core.ObjMap.fromObject(["﷐'type","﷐'related-target","﷐'target"],{"﷐'type":"﷐'mouseenter","﷐'related-target":rtarget__7156,"﷐'target":target__7157}));
if(cljs.core.truth_(cljs.core._EQ_.call(null,"Some content",domina.text.call(null,domina.xpath.xpath.call(null,"//div")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","Some content",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",656))),cljs.core.hash_map("﷐'line",656))),cljs.core.hash_map("﷐'line",656))))));
}
}));
domina.test.add_test.call(null,"can append to a document fragment",(function (){
domina.test.reset.call(null);
var frag__7165 = document.createDocumentFragment();

domina.append_BANG_.call(null,frag__7165,"<div>testing</div>");
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),frag__7165);
if(cljs.core.truth_(cljs.core._EQ_.call(null,"testing",domina.text.call(null,domina.xpath.xpath.call(null,"//div")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","testing",cljs.core.with_meta(cljs.core.list("﷑'text",cljs.core.with_meta(cljs.core.list("﷑'xpath","//div"),cljs.core.hash_map("﷐'line",664))),cljs.core.hash_map("﷐'line",664))),cljs.core.hash_map("﷐'line",664))))));
}
}));
domina.test.add_test.call(null,"doesn't clone unless necessary",(function (){
domina.test.reset.call(null);
var child__7179 = domina.single_node.call(null,"<div>hello</div>");

domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),child__7179);
if(cljs.core.truth_(cljs.core._EQ_.call(null,child__7179,domina.single_node.call(null,domina.xpath.xpath.call(null,"//body/div")))))
{return null;
} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("﷑'=","﷑'child",cljs.core.with_meta(cljs.core.list("﷑'single-node",cljs.core.with_meta(cljs.core.list("﷑'xpath","//body/div"),cljs.core.hash_map("﷐'line",671))),cljs.core.hash_map("﷐'line",671))),cljs.core.hash_map("﷐'line",671))))));
}
}));
domina.test.report = (function report(test_results){
domina.test.reset.call(null);
var G__7181__7182 = cljs.core.seq.call(null,test_results);

if(cljs.core.truth_(G__7181__7182))
{var G__7184__7187 = cljs.core.first.call(null,G__7181__7182);
var vec__7186__7188 = G__7184__7187;
var name__7189 = cljs.core.nth.call(null,vec__7186__7188,0,null);
var result__7190 = cljs.core.nth.call(null,vec__7186__7188,1,null);
var G__7181__7191 = G__7181__7182;

var G__7184__7192 = G__7184__7187;
var G__7181__7193 = G__7181__7191;

while(true){
var vec__7194__7195 = G__7184__7192;
var name__7196 = cljs.core.nth.call(null,vec__7194__7195,0,null);
var result__7197 = cljs.core.nth.call(null,vec__7194__7195,1,null);
var G__7181__7198 = G__7181__7193;

var result_div__7199 = domina.single_node.call(null,"<div class='test-result'></div>");

domina.set_text_BANG_.call(null,result_div__7199,name__7196);
if(cljs.core.truth_(cljs.core.not.call(null,cljs.core._EQ_.call(null,result__7197,null))))
{domina.add_class_BANG_.call(null,result_div__7199,"failed");
domina.append_BANG_.call(null,result_div__7199,cljs.core.str.call(null,"<div class='message'>",result__7197,"</div>"));
} else
{domina.add_class_BANG_.call(null,result_div__7199,"passed");
}
domina.append_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),result_div__7199);
var temp__3698__auto____7200 = cljs.core.next.call(null,G__7181__7198);

if(cljs.core.truth_(temp__3698__auto____7200))
{var G__7181__7201 = temp__3698__auto____7200;

{
var G__7237 = cljs.core.first.call(null,G__7181__7201);
var G__7238 = G__7181__7201;
G__7184__7192 = G__7237;
G__7181__7193 = G__7238;
continue;
}
} else
{}
break;
}
} else
{}
domina.prepend_BANG_.call(null,domina.xpath.xpath.call(null,"//body"),"<div id='test-summary'>ran <span id='total-tests'></span> tests with <span id='total-failures'></span> failures");
domina.set_text_BANG_.call(null,domina.by_id.call(null,"total-tests"),cljs.core.count.call(null,test_results));
var failure_count__7203 = cljs.core.count.call(null,cljs.core.filter.call(null,cljs.core.complement.call(null,cljs.core.nil_QMARK_),cljs.core.map.call(null,cljs.core.second,test_results)));

domina.set_text_BANG_.call(null,domina.by_id.call(null,"total-failures"),failure_count__7203);
if(cljs.core.truth_(cljs.core._EQ_.call(null,0,failure_count__7203)))
{return domina.add_class_BANG_.call(null,domina.by_id.call(null,"test-summary"),"passed");
} else
{return domina.add_class_BANG_.call(null,domina.by_id.call(null,"test-summary"),"failed");
}
});
domina.test.test_results = cljs.core.doall.call(null,domina.test.run_named.call(null,"insert-before! with multiple reference nodes and a single new node"));
domina.test.report.call(null,domina.test.test_results);
