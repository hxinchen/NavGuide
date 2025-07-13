import Router from 'koa-router';
import toolController from '../controllers/toolController';

const router=new Router({
    prefix:'api/tool'
});

router.get('/',toolController.getAllTools);
router.get('/:id',toolController.getToolById);

export default router;