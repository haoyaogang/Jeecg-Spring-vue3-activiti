package org.jeecg.modules.activiti.web;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.jeecg.common.api.vo.Result;
import org.jeecg.common.system.query.QueryGenerator;
import org.jeecg.common.aspect.annotation.AutoLog;
import org.jeecg.common.util.oConvertUtils;

import java.util.Date;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.extern.slf4j.Slf4j;
import org.jeecg.common.system.base.controller.JeecgController;
import org.jeecg.modules.activiti.entity.ActTable;
import org.jeecg.modules.activiti.service.IActTableService;
import org.jeecgframework.poi.excel.ExcelImportUtil;
import org.jeecgframework.poi.excel.def.NormalExcelConstants;
import org.jeecgframework.poi.excel.entity.ExportParams;
import org.jeecgframework.poi.excel.entity.ImportParams;
import org.jeecgframework.poi.excel.view.JeecgEntityExcelView;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import com.alibaba.fastjson.JSON;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

 /**
 * @Description: actTable
 * @Author: jeecg-boot
 * @Date:   2023-06-14
 * @Version: V1.0
 */
@Slf4j
@Api(tags="actTable流程表")
@RestController
@RequestMapping("/actTable")
public class ActTableController extends JeecgController<ActTable, IActTableService> {
	@Autowired
	private IActTableService actTableService;

	/**
	 * 分页列表查询
	 *
	 * @param actTable
	 * @param pageNo
	 * @param pageSize
	 * @param req
	 * @return
	 */
	@AutoLog(value = "actTable-分页列表查询")
	@ApiOperation(value="actTable-分页列表查询", notes="actTable-分页列表查询")
	@GetMapping(value = "/list")
	public Result<?> queryPageList(ActTable actTable,
								   @RequestParam(name="pageNo", defaultValue="1") Integer pageNo,
								   @RequestParam(name="pageSize", defaultValue="10") Integer pageSize,
								   HttpServletRequest req) {
		QueryWrapper<ActTable> queryWrapper = QueryGenerator.initQueryWrapper(actTable, req.getParameterMap());
		Page<ActTable> page = new Page<ActTable>(pageNo, pageSize);
		IPage<ActTable> pageList = actTableService.page(page, queryWrapper);
		return Result.OK(pageList);
	}

	/**
	 * 添加
	 *
	 * @param actTable
	 * @return
	 */
	@AutoLog(value = "actTable-添加")
	@ApiOperation(value="actTable-添加", notes="actTable-添加")
	@PostMapping(value = "/add")
	public Result<?> add(@RequestBody ActTable actTable) {
		actTableService.save(actTable);
		return Result.OK("添加成功！");
	}

	/**
	 * 编辑
	 *
	 * @param actTable
	 * @return
	 */
	@AutoLog(value = "actTable-编辑")
	@ApiOperation(value="actTable-编辑", notes="actTable-编辑")
	@RequestMapping(value = "/edit", method = {RequestMethod.PUT,RequestMethod.POST})
	public Result<?> edit(@RequestBody ActTable actTable) {
		actTableService.updateById(actTable);
		return Result.OK("编辑成功!");
	}

	/**
	 * 通过id删除
	 *
	 * @param id
	 * @return
	 */
	@AutoLog(value = "actTable-通过id删除")
	@ApiOperation(value="actTable-通过id删除", notes="actTable-通过id删除")
	@DeleteMapping(value = "/delete")
	public Result<?> delete(@RequestParam(name="id",required=true) String id) {
		actTableService.removeById(id);
		return Result.OK("删除成功!");
	}

	/**
	 * 批量删除
	 *
	 * @param ids
	 * @return
	 */
	@AutoLog(value = "actTable-批量删除")
	@ApiOperation(value="actTable-批量删除", notes="actTable-批量删除")
	@DeleteMapping(value = "/deleteBatch")
	public Result<?> deleteBatch(@RequestParam(name="ids",required=true) String ids) {
		this.actTableService.removeByIds(Arrays.asList(ids.split(",")));
		return Result.OK("批量删除成功！");
	}

	/**
	 * 通过id查询
	 *
	 * @param id
	 * @return
	 */
	@AutoLog(value = "actTable-通过id查询")
	@ApiOperation(value="actTable-通过id查询", notes="actTable-通过id查询")
	@GetMapping(value = "/queryById")
	public Result<?> queryById(@RequestParam(name="id",required=true) String id) {
		ActTable actTable = actTableService.getById(id);
		return Result.OK(actTable);
	}

  /**
   * 导出excel
   *
   * @param request
   * @param actTable
   */
  @RequestMapping(value = "/exportXls")
  public ModelAndView exportXls(HttpServletRequest request, ActTable actTable) {
      return super.exportXls(request, actTable, ActTable.class, "actTable");
  }

  /**
   * 通过excel导入数据
   *
   * @param request
   * @param response
   * @return
   */
  @RequestMapping(value = "/importExcel", method = RequestMethod.POST)
  public Result<?> importExcel(HttpServletRequest request, HttpServletResponse response) {
      return super.importExcel(request, response, ActTable.class);
  }

}
