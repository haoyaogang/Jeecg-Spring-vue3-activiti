package org.jeecg.modules.activiti.entity;

import java.io.Serializable;
import java.util.Date;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.format.annotation.DateTimeFormat;
import org.jeecgframework.poi.excel.annotation.Excel;

/**
 * @Description: actTable
 * @Author: jeecg-boot
 * @Date:   2023-06-14
 * @Version: V1.0
 */
@Data
@TableName("act_z_table")
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@ApiModel(value="act_z_table对象", description="actTable")
public class ActTable {

	/**id*/
	@TableId(type = IdType.ASSIGN_ID)
    @ApiModelProperty(value = "id")
	private String id;
	/**createBy*/
	@Excel(name = "createBy", width = 15)
    @ApiModelProperty(value = "createBy")
	private String createBy;
	/**createTime*/
	@Excel(name = "createTime", width = 20, format = "yyyy-MM-dd HH:mm:ss")
	@JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss")
    @ApiModelProperty(value = "createTime")
	private Date createTime;
	/**updateBy*/
	@Excel(name = "updateBy", width = 15)
    @ApiModelProperty(value = "updateBy")
	private String updateBy;
	/**updateTime*/
	@Excel(name = "updateTime", width = 20, format = "yyyy-MM-dd HH:mm:ss")
	@JsonFormat(timezone = "GMT+8",pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss")
    @ApiModelProperty(value = "updateTime")
	private Date updateTime;
	/**sysOrgCode*/
	@Excel(name = "sysOrgCode", width = 15)
    @ApiModelProperty(value = "sysOrgCode")
	private String sysOrgCode;
	/**tableName*/
	@Excel(name = "tableName", width = 15)
    @ApiModelProperty(value = "tableName")
	private String tableName;
	/**tablePath*/
	@Excel(name = "tablePath", width = 15)
    @ApiModelProperty(value = "tablePath")
	private String tablePath;
	/**remark*/
	@Excel(name = "remark", width = 15)
    @ApiModelProperty(value = "remark")
	private String remark;

	@Excel(name = "routeType", width = 15)
	@ApiModelProperty(value = "routeType")
	private Integer routeType;
}
